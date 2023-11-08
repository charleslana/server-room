import { disconnectPlayer, handleUserSocket } from './handleUserSocket';
import { handleMainRoomSocket, leaveMainRoom } from './handleMainRoomSocket';
import { handleNewRoomSocket, leaveAllNewRoom } from './handleNewRoomSocket';
import { PlayerSingleton } from 'singleton/PlayerSingleton';
import { Server, Socket } from 'socket.io';

const playerSingleton = PlayerSingleton.getInstance();

export const handleSocket = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    handleUserSocket(socket);
    handleMainRoomSocket(socket, io);
    handleNewRoomSocket(socket, io);
    socket.on('disconnect', () => {
      disconnect(socket);
    });
  });
};

const disconnect = (socket: Socket): void => {
  const player = playerSingleton.get(socket.id);
  if (player) {
    leaveMainRoom(socket);
    leaveAllNewRoom(socket);
    disconnectPlayer(socket, player.name);
  }
};
