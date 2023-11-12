import logger from 'utils/logger';
import { IChat } from 'interface/IChat';
import { IGetChatMessage } from 'interface/IGetChatMessage';
import { IPlayer } from 'interface/IPlayer';
import { IRoom } from 'interface/IRoom';
import { LobbySocket } from './LobbySocket';
import { PlayerSingleton } from 'singleton/PlayerSingleton';
import { RoomSingleton } from 'singleton/RoomSingleton';
import { Server, Socket } from 'socket.io';

export class RoomSocket {
  constructor() {
    this.roomSingleton = RoomSingleton.getInstance();
    this.playerSingleton = PlayerSingleton.getInstance();
    this.lobbySocket = new LobbySocket();
  }

  private roomSingleton: RoomSingleton;
  private playerSingleton: PlayerSingleton;
  private lobbySocket: LobbySocket;
  chats: IChat[] = [];

  public leaveAllRoom(io: Server, socket: Socket): void {
    const player = this.playerSingleton.get(socket.id);
    if (!player) {
      return;
    }
    const rooms = this.roomSingleton.getAll();
    rooms.forEach(room => {
      if (this.roomSingleton.hasRoomPlayerWithName(room.name, player.name)) {
        this.removePlayer(io, socket, room, player);
        this.emitLeaveChat(io, socket, player.name, room.name);
        this.validateDeleteRoom(room);
      }
    });
    this.emitLobbyRoom(io, socket);
  }

  public setupSocket(io: Server, socket: Socket) {
    this.createRoom(io, socket);
    this.joinRoom(io, socket);
    this.leave(io, socket);
    this.getUserRoomInfo(io, socket);
    this.getInRoom(io, socket);
    this.getChatMessagesInRoom(io, socket);
    this.sendMessageInRoom(io, socket);
    this.removeRoomPlayer(io, socket);
    this.changeRoomPassword(io, socket);
    this.getFilterRoom(io, socket);
  }

  private getFilterRoom(io: Server, socket: Socket): void {
    socket.on('get-filter-room', (roomName: string) => {
      const filteredRooms = this.roomSingleton.getRoomsByNameLike(roomName);
      socket.emit('filtered-rooms', filteredRooms);
    });
  }

  private changeRoomPassword(io: Server, socket: Socket): void {
    socket.on('change-room-password', (roomName: string, newPassword: string) => {
      if (roomName.trim() === '') {
        return;
      }
      const player = this.playerSingleton.get(socket.id);
      if (player) {
        this.emitChangeRoomPassword(io, socket, roomName, player.id, newPassword);
      }
    });
  }

  private emitChangeRoomPassword(
    io: Server,
    socket: Socket,
    roomName: string,
    playerId: string,
    newPassword: string
  ): void {
    const room = this.roomSingleton.getPlayerByIdAndRoomName(playerId, roomName);
    if (room && room.isRoomOwner) {
      if (newPassword && newPassword.length <= 6) {
        this.roomSingleton.updateRoomPassword(roomName, newPassword);
      } else {
        this.roomSingleton.updateRoomPassword(roomName, '');
      }
      io.to(roomName).emit('room-info', this.roomSingleton.get(roomName));
      socket
        .to(this.lobbySocket.lobbyRoom)
        .emit('rooms', this.lobbySocket.getTop20RoomsByPlayerCount());
    }
  }

  private removeRoomPlayer(_io: Server, socket: Socket): void {
    socket.on('remove-room-player', (roomName: string, playerName: string) => {
      const player = this.playerSingleton.get(socket.id);
      if (!player) {
        return;
      }
      const getPlayer = this.roomSingleton.getPlayerByIdAndRoomName(player.id, roomName);
      if (getPlayer && getPlayer.isRoomOwner && getPlayer.name !== playerName) {
        socket.to(roomName).emit('leave-room-automatically', playerName);
      }
    });
  }

  private sendMessageInRoom(io: Server, socket: Socket): void {
    socket.on('send-message-in-room', (message: string, roomName: string) => {
      const player = this.playerSingleton.get(socket.id);
      if (player) {
        const chat = this.getChatMessage({ playerName: player.name, message: message });
        this.chats.push(chat);
        io.to(roomName).emit('receive-message-in-room', chat);
      }
    });
  }

  private getChatMessagesInRoom(io: Server, socket: Socket): void {
    socket.on('get-chat-messages-in-room', (roomName: string) => {
      const player = this.playerSingleton.get(socket.id);
      if (player) {
        const chat = this.getChatMessage({ playerName: player.name, isJoin: true });
        this.chats.push(chat);
        io.to(roomName).emit('receive-message-in-room', chat);
      }
    });
  }

  private getInRoom(_io: Server, socket: Socket): void {
    socket.on('get-in-room', (roomName: string) => {
      socket.emit('in-room', this.roomSingleton.get(roomName));
    });
  }

  private getUserRoomInfo(_io: Server, socket: Socket): void {
    socket.on('get-user-room-info', (roomName: string) => {
      const player = this.playerSingleton.get(socket.id);
      if (player && this.roomSingleton.hasRoomWithName(roomName)) {
        const getRoomPlayer = this.roomSingleton.getPlayerByIdAndRoomName(player.id, roomName);
        const room = this.roomSingleton.get(roomName);
        socket.emit('user-room-info', getRoomPlayer, room);
      }
    });
  }

  private leave(io: Server, socket: Socket): void {
    socket.on('leave-room', (roomName: string) => {
      const room = this.roomSingleton.get(roomName);
      if (!room) {
        return;
      }
      const player = this.playerSingleton.get(socket.id);
      if (player) {
        this.removePlayer(io, socket, room, player);
        this.emitLeaveChat(io, socket, player.name, roomName);
        this.validateDeleteRoom(room);
        this.emitLobbyRoom(io, socket);
        this.lobbySocket.join(io, socket);
      }
    });
  }

  private emitLobbyRoom(io: Server, socket: Socket): void {
    socket
      .to(this.lobbySocket.lobbyRoom)
      .emit('rooms', this.lobbySocket.getTop20RoomsByPlayerCount());
  }

  private removePlayer(io: Server, socket: Socket, room: IRoom, player: IPlayer): void {
    this.setRoomOwner(io, socket, room, player);
    this.roomSingleton.deletePlayerByIdAndRoomName(player.id, room.name);
    socket.to(room.name).emit('in-room', this.roomSingleton.get(room.name));
  }

  private validateDeleteRoom(room: IRoom): void {
    if (room.players.length === 0) {
      this.roomSingleton.delete(room.name);
    }
  }

  private emitLeaveChat(_io: Server, socket: Socket, playerName: string, roomName: string): void {
    const chat = this.getChatMessage({ playerName: playerName });
    this.chats.push(chat);
    socket.to(roomName).emit('receive-message-in-room', chat);
    socket.leave(roomName);
    socket.emit('leave-room-success');
    logger.info(`${playerName} left the room: ${roomName}`);
  }

  private getChatMessage(getMessage: IGetChatMessage): IChat {
    const join = getMessage.isJoin ? 'entrou na' : 'saiu da';
    const chat: IChat = {
      playerName: !getMessage.message ? 'Servidor' : getMessage.playerName,
      message: getMessage.message ? getMessage.message : `${getMessage.playerName} ${join} sala`,
    };
    return chat;
  }
  private setRoomOwner(io: Server, socket: Socket, room: IRoom, player: IPlayer): void {
    if (room.players.length <= 1) {
      return;
    }
    const currentOwner = room.players.find(p => p.name === player.name && p.isRoomOwner);
    if (!currentOwner) {
      return;
    }
    this.emitRoomOwner(io, socket, room, player, currentOwner);
  }

  private emitRoomOwner(
    _io: Server,
    socket: Socket,
    room: IRoom,
    newPlayer: IPlayer,
    currentOwner: IPlayer
  ): void {
    const newOwner = room.players.find(p => p.name !== newPlayer.name);
    if (newOwner) {
      this.roomSingleton.updateRoomPlayerWithName(room, currentOwner.name, false);
      this.roomSingleton.updateRoomPlayerWithName(room, newOwner.name, true);
      currentOwner.isRoomOwner = false;
      newOwner.isRoomOwner = true;
      socket.to(room.name).emit('user-room-info', newOwner, room);
    }
  }

  private joinRoom(io: Server, socket: Socket): void {
    socket.on('join-room', (roomName: string, password: string) => {
      const room = this.roomSingleton.get(roomName);
      if (!room || room.players.length >= 2) {
        return;
      }
      if (room.password !== password) {
        socket.emit('join-room-error', 'Senha da sala incorreta.');
        return;
      }
      this.joinPlayerToRoom(io, socket, roomName);
      this.lobbySocket.leave(io, socket);
      this.emitJoinRoom(io, socket, roomName);
    });
  }

  private emitJoinRoom(_io: Server, socket: Socket, roomName: string): void {
    socket.join(roomName);
    socket.emit('join-room-success', roomName);
    socket
      .to(this.lobbySocket.lobbyRoom)
      .emit('rooms', this.lobbySocket.getTop20RoomsByPlayerCount());
    socket.to(roomName).emit('in-room', this.roomSingleton.get(roomName));
  }

  private joinPlayerToRoom(_io: Server, socket: Socket, roomName: string): void {
    const player = this.playerSingleton.get(socket.id);
    if (player) {
      this.roomSingleton.addPlayerToRoom(
        {
          id: player.id,
          name: player.name,
          isRoomOwner: false,
        },
        roomName
      );
      logger.info(`${player.name} joined room: ${roomName}`);
    }
  }

  private createRoom(io: Server, socket: Socket): void {
    socket.on('create-room', (roomName: string, password?: string) => {
      if (!this.isValidRoomCharacter(roomName) || !this.isValidRoomName(roomName)) {
        return;
      }
      if (this.roomNameExists(roomName)) {
        socket.emit('room-creation-failed', 'A sala já existe com esse nome.');
        return;
      }
      this.createPlayerToRoom(io, socket, roomName, password);
      this.lobbySocket.leave(io, socket);
      this.emitCreateRoom(io, socket, roomName);
    });
  }

  private emitCreateRoom(_io: Server, socket: Socket, roomName: string): void {
    socket.join(roomName.trim());
    socket.emit('room-created', roomName.trim());
    socket
      .to(this.lobbySocket.lobbyRoom)
      .emit('rooms', this.lobbySocket.getTop20RoomsByPlayerCount());
  }

  private createPlayerToRoom(
    _io: Server,
    socket: Socket,
    roomName: string,
    password?: string
  ): void {
    const player = this.playerSingleton.get(socket.id);
    if (player) {
      this.addRoom(roomName, password);
      this.roomSingleton.addPlayerToRoom(
        {
          id: player.id,
          name: player.name,
          isRoomOwner: true,
        },
        roomName
      );
      logger.info(`${player.name} created and joined room: ${roomName.trim()}`);
    }
  }

  private addRoom(roomName: string, password?: string): void {
    if (password && password.length <= 6) {
      this.roomSingleton.add({ name: roomName.trim(), password: password, players: [] });
    } else {
      this.roomSingleton.add({ name: roomName.trim(), password: '', players: [] });
    }
  }

  private isValidRoomCharacter(roomName: string): boolean {
    return roomName.trim() !== '' && roomName.length <= 15 && roomName !== 'lobby';
  }

  private isValidRoomName(roomName: string): boolean {
    const playerNameRegex = /^[a-zA-Z0-9]+$/;
    return playerNameRegex.test(roomName);
  }

  private roomNameExists(roomName: string): boolean {
    return this.roomSingleton.hasRoomWithName(roomName.trim());
  }
}
