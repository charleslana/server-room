import { IChat } from 'interface/IChat';
import { IPlayer } from 'interface/IPlayer';
import { IRoom } from 'interface/IRoom';
import { joinMainRoom, leaveMainRoom, mainRoom } from './handleMainRoomSocket';
import { PlayerSingleton } from 'singleton/PlayerSingleton';
import { RoomSingleton } from 'singleton/RoomSingleton';
import { Server, Socket } from 'socket.io';

const roomSingleton = RoomSingleton.getInstance();
const playerSingleton = PlayerSingleton.getInstance();
const chatList: IChat[] = [];

export const leaveAllNewRoom = (socket: Socket) => {
  const player = playerSingleton.get(socket.id);
  if (player) {
    const rooms = roomSingleton.getAll();
    rooms.forEach(room => {
      if (roomSingleton.hasRoomPlayerWithName(room.name, player.name)) {
        setRoomOwner(socket, room, player.name);
        roomSingleton.deletePlayerInRoom(room.name, player.name);
        socket.to(room.name).emit('players-in-room', getPlayersInRoom(room.name));
        leaveChat(socket, player.name, room.name);
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

export const handleNewRoomSocket = (socket: Socket, io: Server): void => {
  handleCreateRoom(socket);
  socket.on('get-rooms', () => {
    socket.emit('rooms', getRooms());
  });
  socket.on('join-room', (roomName: string, password?: string) => {
    const room = roomSingleton.get(roomName);
    if (room && room.players.length < 2) {
      if (room.password && room.password !== password) {
        socket.emit('join-room-error', 'Senha da sala incorreta.');
        return;
      }
      const player = playerSingleton.get(socket.id)!;
      roomSingleton.addPlayerToRoom(roomName, {
        id: player.id,
        name: player.name,
        isRoomOwner: false,
      });
      leaveMainRoom(socket);
      socket.join(roomName);
      socket.emit('join-room-success', roomName);
      socket.to(mainRoom).emit('rooms', getRooms());
      socket.to(roomName).emit('players-in-room', getPlayersInRoom(roomName));
      console.log(`${player.name} joined room: ${roomName}`);
    }
  });
  socket.on('leave-room', (roomName: string) => {
    const room = roomSingleton.get(roomName);
    if (room) {
      const player = playerSingleton.get(socket.id)!;
      setRoomOwner(socket, room, player.name);
      roomSingleton.deletePlayerInRoom(roomName, player.name);
      socket.to(roomName).emit('players-in-room', getPlayersInRoom(roomName));
      leaveChat(socket, player.name, roomName);
      socket.leave(roomName);
      socket.emit('leave-room-success');
      console.log(`${player.name} left the room: ${roomName}`);
      if (room.players.length === 0) {
        roomSingleton.delete(room.name);
      }
      socket.to(mainRoom).emit('rooms', getRooms());
      joinMainRoom(socket);
    }
  });
  socket.on('get-user-room-info', (roomName: string) => {
    const player = playerSingleton.get(socket.id);
    if (player && roomSingleton.hasRoomWithName(roomName)) {
      const getRoomPlayer = roomSingleton.getPlayerInRoom(roomName, player.name);
      const room = roomSingleton.get(roomName);
      socket.emit('user-room-info', getRoomPlayer, room);
    }
  });
  socket.on('get-players-in-room', (roomName: string) => {
    socket.emit('players-in-room', getPlayersInRoom(roomName));
  });
  socket.on('get-chat-messages-in-room', (roomName: string) => {
    joinChat(socket, io, roomName);
  });
  socket.on('send-message-in-room', (message: string, roomName: string) => {
    const player = playerSingleton.get(socket.id);
    if (player) {
      const chat: IChat = {
        playerName: player.name,
        message: message,
      };
      chatList.push(chat);
      io.to(roomName).emit('receive-message-in-room', chat);
    }
  });
  socket.on('remove-room-player', (roomName: string, playerName: string) => {
    const player = playerSingleton.get(socket.id);
    if (player) {
      const getPlayer = roomSingleton.getPlayerInRoom(roomName, player.name);
      if (getPlayer && getPlayer.isRoomOwner && getPlayer.name !== playerName) {
        socket.to(roomName).emit('leave-room-automatically', playerName);
      }
    }
  });
  socket.on('change-room-password', (roomName: string, newPassword: string) => {
    if (roomName.trim() !== '') {
      newPassword = newPassword.slice(0, 6);
      const player = playerSingleton.get(socket.id);
      if (player) {
        const room = roomSingleton.getPlayerInRoom(roomName, player.name);
        if (room && room.isRoomOwner) {
          roomSingleton.updateRoomPassword(roomName, newPassword);
          io.to(roomName).emit('room-info', roomSingleton.get(roomName));
          socket.to(mainRoom).emit('rooms', getRooms());
        }
      }
    }
  });
  socket.on('get-filter-room', (roomName: string) => {
    const filteredRooms = roomSingleton.getRoomsByNameLike(roomName);
    socket.emit('filtered-rooms', filteredRooms);
  });
};

const handleCreateRoom = (socket: Socket): void => {
  socket.on('create-room', (roomName: string, password?: string) => {
    if (roomName.trim() !== '') {
      const roomNameRegex = /^[a-z0-9]+$/;
      if (!roomNameRegex.test(roomName)) {
        socket.emit(
          'room-creation-failed',
          'O nome da sala deve ser apenas letras minúsculas e números.'
        );
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
        if (password) {
          password = password.slice(0, 6).trim();
        }
        roomSingleton.add({ name: roomName.trim(), password: password, players: [] });
      }
      const player = playerSingleton.get(socket.id)!;
      const room = roomSingleton.get(roomName.trim());
      if (room) {
        roomSingleton.addPlayerToRoom(roomName, {
          id: player.id,
          name: player.name,
          isRoomOwner: true,
        });
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
  const rooms = roomSingleton.getTop20RoomsByPlayerCount();
  return rooms.filter(room => room.name !== mainRoom);
};

const setRoomOwner = (socket: Socket, room: IRoom, playerName: string): void => {
  if (room.players.length > 1) {
    const currentOwner = room.players.find(
      player => player.name === playerName && player.isRoomOwner
    );
    if (currentOwner) {
      const newOwner = room.players.find(player => player.name !== playerName);
      if (newOwner) {
        roomSingleton.updateRoomPlayerWithName(room.name, currentOwner.name, false);
        roomSingleton.updateRoomPlayerWithName(room.name, newOwner.name, true);
        currentOwner.isRoomOwner = false;
        newOwner.isRoomOwner = true;
        socket.to(room.name).emit('user-room-info', newOwner, room);
      }
    }
  }
};

const getPlayersInRoom = (roomName: string): IPlayer[] => {
  const room = roomSingleton.get(roomName);
  if (room) {
    return room.players;
  }
  return [];
};

const joinChat = (socket: Socket, io: Server, roomName: string): void => {
  const player = playerSingleton.get(socket.id);
  if (player) {
    const chat: IChat = {
      playerName: 'Servidor',
      message: `${player.name} entrou na sala`,
    };
    chatList.push(chat);
    io.to(roomName).emit('receive-message-in-room', chat);
  }
};

const leaveChat = (socket: Socket, playerName: string, roomName: string): void => {
  const chat: IChat = {
    playerName: 'Servidor',
    message: `${playerName} saiu da sala`,
  };
  chatList.push(chat);
  socket.to(roomName).emit('receive-message-in-room', chat);
};
