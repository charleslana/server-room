import logger from 'utils/logger';
import { IChat } from 'interface/IChat';
import { IGetChatMessage } from 'interface/IGetChatMessage';
import { IRoom } from 'interface/IRoom';
import { PlayerSingleton } from 'singleton/PlayerSingleton';
import { RoomSingleton } from 'singleton/RoomSingleton';
import { Server, Socket } from 'socket.io';
import { UserSocket } from './UserSocket';

export class LobbySocket {
  constructor() {
    this.roomSingleton = RoomSingleton.getInstance();
    this.playerSingleton = PlayerSingleton.getInstance();
  }

  public lobbyRoom = 'lobby-room';

  private roomSingleton: RoomSingleton;
  private playerSingleton: PlayerSingleton;
  private chats: IChat[] = [];

  public join(_io: Server, socket: Socket): void {
    if (!this.roomSingleton.hasRoomWithName(this.lobbyRoom)) {
      this.roomSingleton.add({ name: this.lobbyRoom, players: [] });
    }
    const player = this.playerSingleton.get(socket.id);
    if (player) {
      this.roomSingleton.addPlayerToRoom(player, this.lobbyRoom);
      socket.join(this.lobbyRoom);
      socket.to(this.lobbyRoom).emit('players-lobby-room', this.roomSingleton.get(this.lobbyRoom));
      logger.info(`${player.name} joined ${this.lobbyRoom}`);
    }
  }

  public leave(_io: Server, socket: Socket): void {
    const player = this.playerSingleton.get(socket.id);
    if (!player) {
      return;
    }
    const room = this.roomSingleton.getPlayerByIdAndRoomName(player.id, this.lobbyRoom);
    if (room) {
      const chat = this.getChatMessage({ playerName: player.name });
      this.chats.push(chat);
      socket.to(this.lobbyRoom).emit('receive-message-lobby-room', chat);
      this.roomSingleton.deletePlayerByIdAndRoomName(player.id, this.lobbyRoom);
      socket.to(this.lobbyRoom).emit('players-lobby-room', this.roomSingleton.get(this.lobbyRoom));
      socket.leave(this.lobbyRoom);
      logger.info(`${player.name} left the ${this.lobbyRoom}`);
    }
  }

  public getTop20RoomsByPlayerCount(): IRoom[] {
    const rooms = this.roomSingleton.getTop20RoomsByPlayerCount();
    return rooms.filter(room => room.name !== this.lobbyRoom);
  }

  public setupSocket(io: Server, socket: Socket) {
    this.getPlayersLobbyRoom(io, socket);
    this.leaveLobbyRoom(io, socket);
    this.getChatMessagesLobbyRoom(io, socket);
    this.sendMessageLobbyRoom(io, socket);
    this.getRooms(io, socket);
  }

  private getRooms(io: Server, socket: Socket): void {
    socket.on('get-rooms', () => {
      socket.emit('rooms', this.getTop20RoomsByPlayerCount());
    });
  }

  private getPlayersLobbyRoom(_io: Server, socket: Socket): void {
    socket.on('get-players-lobby-room', () => {
      socket.emit('players-lobby-room', this.roomSingleton.get(this.lobbyRoom));
    });
  }

  private leaveLobbyRoom(io: Server, socket: Socket): void {
    socket.on('leave-lobby-room', () => {
      this.leave(io, socket);
      const userSocket = new UserSocket();
      userSocket.removePlayer(io, socket);
      socket.emit('leave-lobby-room-success');
    });
  }

  private getChatMessagesLobbyRoom(io: Server, socket: Socket): void {
    socket.on('get-chat-messages-lobby-room', () => {
      const player = this.playerSingleton.get(socket.id);
      if (player) {
        const chat = this.getChatMessage({ playerName: player.name, isJoin: true });
        this.chats.push(chat);
        io.to(this.lobbyRoom).emit('receive-message-lobby-room', chat);
      }
    });
  }

  private sendMessageLobbyRoom(io: Server, socket: Socket): void {
    socket.on('send-message-lobby-room', (message: string) => {
      const player = this.playerSingleton.get(socket.id);
      if (player) {
        const chat = this.getChatMessage({ playerName: player.name, message: message });
        this.chats.push(chat);
        io.to(this.lobbyRoom).emit('receive-message-lobby-room', chat);
      }
    });
  }

  private getChatMessage(getMessage: IGetChatMessage): IChat {
    const join = getMessage.isJoin ? 'entrou na' : 'saiu da';
    const chat: IChat = {
      playerName: !getMessage.message ? 'Servidor' : getMessage.playerName,
      message: getMessage.message
        ? getMessage.message
        : `${getMessage.playerName} ${join} sala Lobby`,
    };
    return chat;
  }
}
