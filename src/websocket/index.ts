import { LobbySocket } from './LobbySocket';
import { RoomSocket } from './RoomSocket';
import { Server } from 'socket.io';
import { UserSocket } from './UserSocket';

export function configureSockets(io: Server) {
  io.on('connection', socket => {
    const userSocket = new UserSocket();
    userSocket.setupSocket(io, socket);
    const lobbySocket = new LobbySocket();
    lobbySocket.setupSocket(io, socket);
    const roomSocket = new RoomSocket();
    roomSocket.setupSocket(io, socket);
    socket.on('disconnect', () => {
      lobbySocket.leave(io, socket);
      roomSocket.leaveAllRoom(io, socket);
      userSocket.removePlayer(io, socket);
    });
  });
}
