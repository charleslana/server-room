import { disconnectPlayer } from './handleUserSocket';
import { IChat } from 'interface/IChat';
import { PlayerSingleton } from 'singleton/PlayerSingleton';
import { RoomSingleton } from 'singleton/RoomSingleton';
import { Server, Socket } from 'socket.io';

const roomSingleton = RoomSingleton.getInstance();
const playerSingleton = PlayerSingleton.getInstance();
const chatList: IChat[] = [];

export const mainRoom = 'main-room';

export const joinMainRoom = (socket: Socket, playerName: string): void => {
  if (!roomSingleton.getAll().has(mainRoom)) {
    roomSingleton.set(mainRoom, []);
  }
  roomSingleton.get(mainRoom)!.push(playerName);
  socket.join(mainRoom);
  socket.to(mainRoom).emit('players-main-room', roomSingleton.get(mainRoom));
  console.log(`${playerName} joined main room.`);
};

export const leaveMainRoom = (socket: Socket): void => {
  const rooms = roomSingleton.getAll();
  if (rooms.has(mainRoom)) {
    const playersInRoom = rooms.get(mainRoom)!;
    const playerName = playerSingleton.get(socket.id)!;
    const playerIndex = playersInRoom.indexOf(playerName!);
    if (playerIndex !== -1) {
      playersInRoom.splice(playerIndex, 1);
      socket.to(mainRoom).emit('players-main-room', roomSingleton.get(mainRoom));
      leaveChat(socket, playerName);
      socket.leave(mainRoom);
      console.log(`${playerName} left the main room.`);
    }
  }
};

export const handleMainRoomSocket = (socket: Socket, io: Server): void => {
  socket.on('get-players-main-room', () => {
    socket.emit('players-main-room', roomSingleton.get(mainRoom));
  });
  socket.on('leave-main-room', () => {
    leaveMainRoom(socket);
    socket.emit('leave-main-room-success');
    const playerName = playerSingleton.get(socket.id)!;
    disconnectPlayer(socket, playerName);
  });
  socket.on('get-chat-messages-main-room', () => {
    joinChat(socket, io);
  });
  socket.on('send-message-main-room', (message: string) => {
    const chat: IChat = {
      playerName: playerSingleton.get(socket.id)!,
      message: message,
    };
    chatList.push(chat);
    io.to(mainRoom).emit('receive-message-main-room', chat);
  });
};

const joinChat = (socket: Socket, io: Server): void => {
  const playerName = playerSingleton.get(socket.id);
  const chat: IChat = {
    playerName: 'Servidor',
    message: `${playerName} entrou na sala principal`,
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
