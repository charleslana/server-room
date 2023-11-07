import { joinMainRoom } from './handleMainRoomSocket';
import { PlayerSingleton } from 'singleton/PlayerSingleton';
import { Socket } from 'socket.io';

const playerSingleton = PlayerSingleton.getInstance();

export const handleUserSocket = (socket: Socket): void => {
  socket.on('join', (playerName: string) => {
    joinUser(socket, playerName);
  });
};

export const disconnectPlayer = (socket: Socket, playerName: string): void => {
  playerSingleton.delete(socket.id);
  console.log(`${playerName} disconnected`);
};

const joinUser = (socket: Socket, playerName: string): void => {
  if (playerName.trim() !== '') {
    const playerNameRegex = /^[a-zA-Z0-9]+$/;
    if (!playerNameRegex.test(playerName)) {
      socket.emit('user-join-failed', 'O nome do usuário deve ser apenas letras e números.');
      return;
    }
    const exist = playerSingleton.hasPlayerWithName(playerName);
    if (exist) {
      socket.emit('user-join-failed', 'Nome do usuário já existe.');
      return;
    }
    playerSingleton.add({
      id: socket.id,
      name: playerName,
    });
    socket.emit('join-success');
    console.log(`${playerName} connected`);
    joinMainRoom(socket);
  }
};
