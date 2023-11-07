import { IRoom } from 'interface/IRoom';
import { joinMainRoom, leaveMainRoom, mainRoom } from './handleMainRoomSocket';
import { PlayerSingleton } from 'singleton/PlayerSingleton';
import { RoomSingleton } from 'singleton/RoomSingleton';
import { Socket } from 'socket.io';

const roomSingleton = RoomSingleton.getInstance();
const playerSingleton = PlayerSingleton.getInstance();

export const leaveAllNewRoom = (socket: Socket) => {
  const player = playerSingleton.get(socket.id);
  if (player) {
    const rooms = roomSingleton.getAll();
    rooms.forEach(room => {
      if (roomSingleton.hasRoomPlayerWithName(room.name, player.name)) {
        roomSingleton.deletePlayerInRoom(room.name, player.name);
        socket.leave(room.name);
        console.log(`${player.name} left the room: ${room.name}`);
        if (room.players.length === 0) {
          roomSingleton.delete(room.name);
        }
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
    const room = roomSingleton.get(roomName);
    if (room) {
      const player = playerSingleton.get(socket.id)!;
      roomSingleton.addPlayerToRoom(roomName, player);
      leaveMainRoom(socket);
      socket.join(roomName);
      socket.emit('join-room-success', roomName);
      console.log(`${player.name} joined room: ${roomName}`);
    }
  });
  socket.on('leave-room', (roomName: string) => {
    const room = roomSingleton.get(roomName);
    if (room) {
      const player = playerSingleton.get(socket.id)!;
      roomSingleton.deletePlayerInRoom(roomName, player.name);
      socket.leave(roomName);
      socket.emit('leave-room-success');
      console.log(`${player.name} left the room: ${roomName}`);
      if (room.players.length === 0) {
        roomSingleton.delete(room.name);
        socket.to(mainRoom).emit('rooms', getRooms());
      }
      joinMainRoom(socket);
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
      if (roomSingleton.hasRoomWithName(roomName.trim())) {
        socket.emit('room-creation-failed', 'A sala já existe com esse nome.');
        return;
      }
      if (!roomSingleton.hasRoomWithName(roomName.trim())) {
        roomSingleton.add({ name: roomName.trim(), players: [] });
      }
      const player = playerSingleton.get(socket.id)!;
      const room = roomSingleton.get(roomName.trim());
      if (room) {
        roomSingleton.addPlayerToRoom(roomName, player);
        leaveMainRoom(socket);
        socket.join(roomName.trim());
        socket.emit('room-created', roomName.trim());
        socket.to(mainRoom).emit('rooms', getRooms());
        console.log(`${player.name} created and joined room: ${roomName.trim()}`);
      }
    }
  });
};

const getRooms = (): IRoom[] => {
  const rooms = RoomSingleton.getInstance().getAll();
  return rooms.filter(room => room.name !== mainRoom);
};
