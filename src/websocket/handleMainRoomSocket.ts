import { disconnectPlayer } from './handleUserSocket';
import { IChat } from 'interface/IChat';
import { PlayerSingleton } from 'singleton/PlayerSingleton';
import { RoomSingleton } from 'singleton/RoomSingleton';
import { Server, Socket } from 'socket.io';

const roomSingleton = RoomSingleton.getInstance();
const playerSingleton = PlayerSingleton.getInstance();
const chatList: IChat[] = [];

export const mainRoom = 'main-room';

export const joinMainRoom = (socket: Socket): void => {
  if (!roomSingleton.hasRoomWithName(mainRoom)) {
    roomSingleton.add({ name: mainRoom, players: [] });
  }
  const player = PlayerSingleton.getInstance().get(socket.id)!;
  roomSingleton.addPlayerToRoom(mainRoom, player);
  socket.join(mainRoom);
  socket.to(mainRoom).emit('players-main-room', roomSingleton.get(mainRoom));
  console.log(`${player.name} joined ${mainRoom}`);
};

export const leaveMainRoom = (socket: Socket): void => {
  const player = playerSingleton.get(socket.id)!;
  const room = roomSingleton.getPlayerInRoom(mainRoom, player.name);
  if (room) {
    roomSingleton.deletePlayerInRoom(mainRoom, player.name);
    socket.to(mainRoom).emit('players-main-room', roomSingleton.get(mainRoom));
    leaveChat(socket, player.name);
    socket.leave(mainRoom);
    console.log(`${player.name} left the ${mainRoom}`);
  }
};

export const handleMainRoomSocket = (socket: Socket, io: Server): void => {
  socket.on('get-players-main-room', () => {
    socket.emit('players-main-room', roomSingleton.get(mainRoom));
  });
  socket.on('leave-main-room', () => {
    leaveMainRoom(socket);
    socket.emit('leave-main-room-success');
    const player = playerSingleton.get(socket.id)!;
    disconnectPlayer(socket, player.name);
  });
  socket.on('get-chat-messages-main-room', () => {
    joinChat(socket, io);
  });
  socket.on('send-message-main-room', (message: string) => {
    const player = playerSingleton.get(socket.id)!;
    const chat: IChat = {
      playerName: player.name,
      message: message,
    };
    chatList.push(chat);
    io.to(mainRoom).emit('receive-message-main-room', chat);
  });
};

const joinChat = (socket: Socket, io: Server): void => {
  const player = playerSingleton.get(socket.id)!;
  const chat: IChat = {
    playerName: 'Servidor',
    message: `${player.name} entrou na sala principal`,
  };
  chatList.push(chat);
  io.to(mainRoom).emit('receive-message-main-room', chat);
};

const leaveChat = (socket: Socket, playerName: string): void => {
  const chat: IChat = {
    playerName: 'Servidor',
    message: `${playerName} saiu da sala principal`,
  };
  chatList.push(chat);
  socket.to(mainRoom).emit('receive-message-main-room', chat);
};
