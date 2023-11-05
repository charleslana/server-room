import { joinMainRoom, leaveMainRoom, mainRoom } from './handleMainRoomSocket';
import { PlayerSingleton } from 'singleton/PlayerSingleton';
import { RoomSingleton } from 'singleton/RoomSingleton';
import { Socket } from 'socket.io';

const roomSingleton = RoomSingleton.getInstance();
const playerSingleton = PlayerSingleton.getInstance();

export const leaveAllNewRoom = (socket: Socket) => {
  const playerName = playerSingleton.get(socket.id);
  if (playerName) {
    const allRooms = roomSingleton.getAll();
    allRooms.forEach((room, roomName) => {
      const playerIndex = room.indexOf(playerName);
      if (playerIndex !== -1) {
        room.splice(playerIndex, 1);
        socket.leave(roomName);
        console.log(`${playerName} left the room: ${roomName}`);
        if (room.length === 0) {
          roomSingleton.delete(roomName);
        }
        // TODO remove o player de todas as rooms
        // socket.to(roomName).emit('players-in-room', room);
      }
    });
    socket.to(mainRoom).emit('rooms', getRooms());
  }
};

export const handleNewRoomSocket = (socket: Socket): void => {
  handleCreateRoom(socket);
  socket.on('get-rooms', () => {
    socket.emit('rooms', getRooms());
  });
  socket.on('join-room', (roomName: string) => {
    if (roomSingleton.getAll().has(roomName)) {
      const rooms = roomSingleton.get(roomName)!;
      const playerName = playerSingleton.get(socket.id)!;
      if (!rooms.includes(playerName)) {
        rooms.push(playerName);
        leaveMainRoom(socket);
        socket.join(roomName);
        socket.emit('join-room-success', roomName);
        console.log(`${playerName} joined room: ${roomName}`);
      }
    }
  });
  socket.on('leave-room', (roomName: string) => {
    if (roomSingleton.getAll().has(roomName)) {
      const rooms = roomSingleton.get(roomName);
      if (rooms) {
        const playerName = playerSingleton.get(socket.id)!;
        const playerIndex = rooms.indexOf(playerName);
        if (playerIndex !== -1) {
          rooms.splice(playerIndex, 1);
          socket.leave(roomName);
          socket.emit('leave-room-success');
          console.log(`${playerName} left the room: ${roomName}`);
          // TODO remove o player da room atual
          // socket.to(roomName).emit('players-in-room', room);
        }
        if (rooms.length === 0) {
          roomSingleton.delete(roomName);
          socket.to(mainRoom).emit('rooms', getRooms());
        }
        joinMainRoom(socket, playerName);
      }
    }
  });
};

const handleCreateRoom = (socket: Socket): void => {
  socket.on('create-room', (roomName: string) => {
    if (roomName.trim() !== '') {
      const roomNameRegex = /^[a-zA-Z0-9]+$/;
      if (!roomNameRegex.test(roomName)) {
        socket.emit('room-creation-failed', 'O nome da sala deve ser apenas letras e números.');
        return;
      }
      if (roomName.trim().length > 15) {
        socket.emit('room-creation-failed', 'O nome da sala deve conter no máximo 15 caracteres.');
        return;
      }
      if (roomSingleton.getAll().has(roomName.trim())) {
        socket.emit('room-creation-failed', 'A sala já existe com esse nome.');
        return;
      }
      if (!roomSingleton.getAll().has(roomName.trim())) {
        roomSingleton.set(roomName.trim(), []);
      }
      const playerName = playerSingleton.get(socket.id)!;
      const room = roomSingleton.get(roomName.trim());
      if (room) {
        room.push(playerName);
      }
      leaveMainRoom(socket);
      socket.join(roomName.trim());
      // TODO mostrar os players da new room view
      // socket.to(roomName).emit('players-in-room', roomSingleton.get(roomName));
      socket.emit('room-created', roomName.trim());
      socket.to(mainRoom).emit('rooms', getRooms());
      console.log(`${playerName} created and joined room: ${roomName.trim()}`);
    }
  });
};

const getRooms = (): string[] => {
  const allRooms = Array.from(roomSingleton.getAll().keys());
  const filteredRooms = allRooms.filter(roomName => roomName !== mainRoom);
  return filteredRooms;
};
