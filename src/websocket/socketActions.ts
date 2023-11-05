import { Server, Socket } from 'socket.io';

const players = new Map<string, string>();
const rooms = new Map<string, string[]>();
const mainRoom = 'main-room';

interface ChatMessage {
  id: number;
  playerName: string;
  text: string;
}
const chatMessages: ChatMessage[] = [];

const handleSocketActions = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    socket.on('join', (playerName: string) => {
      players.set(socket.id, playerName);
      socket.join(mainRoom);
      if (!rooms.has(mainRoom)) {
        rooms.set(mainRoom, []);
      }
      rooms.get(mainRoom)!.push(playerName);
      socket.to(mainRoom).emit('players-main-room', rooms.get(mainRoom));
      socket.emit('join-response', 'success');
      console.log(`${playerName} connected`);
      console.log(`${playerName} joined main room.`);
    });

    socket.on('get-players-main-room', () => {
      socket.emit('players-main-room', rooms.get(mainRoom));
    });

    socket.on('get-chat-messages-main-room', (playerName: string) => {
      const joinChat: ChatMessage = {
        id: chatMessages.length + 1,
        playerName: 'Servidor',
        text: `${playerName} entrou na sala principal`,
      };
      chatMessages.push(joinChat);
      io.to(mainRoom).emit('receive-message-main-room', joinChat);
    });

    socket.on('send-message-main-room', (chatMessage: ChatMessage) => {
      const id = chatMessages.length + 1;
      chatMessage.id = id;
      chatMessages.push(chatMessage);
      io.to(mainRoom).emit('receive-message-main-room', chatMessage);
    });

    socket.on('create-room', (roomName: string, playerName: string) => {
      if (!rooms.has(roomName)) {
        rooms.set(roomName, []);
      }
      socket.join(roomName);
      socket.to(roomName).emit('players-in-room', rooms.get(roomName));
      console.log(`${playerName} created and joined room: ${roomName}`);
    });

    socket.on('join-room', (roomName: string, playerName: string) => {
      if (rooms.has(roomName)) {
        const room = rooms.get(roomName)!;
        if (!room.includes(playerName)) {
          room.push(playerName);
          socket.join(roomName);
          socket.to(roomName).emit('players-in-room', room);
          console.log(`${playerName} joined room: ${roomName}`);
        }
      }
    });

    socket.on('leave-main-room', (playerName: string) => {
      const playersInRoom = rooms.get(mainRoom)!;
      const playerIndex = playersInRoom.indexOf(playerName);
      if (playerIndex !== -1) {
        playersInRoom.splice(playerIndex, 1);
      }
      socket.to(mainRoom).emit('players-main-room', rooms.get(mainRoom));
      sendMessageDisconnected(socket, playerName);
      console.log(`${playerName} left the main room.`);
    });

    socket.on('get-rooms', () => {
      socket.emit('rooms', Array.from(rooms.keys()));
    });

    socket.on('logout', () => {
      logout(socket);
    });

    socket.on('disconnect', () => {
      logout(socket);
    });
  });
};

const logout = (socket: Socket): void => {
  const playerName = players.get(socket.id);
  if (playerName) {
    if (rooms.has(mainRoom)) {
      const playersInRoom = rooms.get(mainRoom)!;
      const playerIndex = playersInRoom.indexOf(playerName);
      if (playerIndex !== -1) {
        playersInRoom.splice(playerIndex, 1);
      }
      socket.to(mainRoom).emit('players-main-room', rooms.get(mainRoom));
      console.log(`${playerName} disconnected`);
    }
    players.delete(socket.id);
  }
};

const sendMessageDisconnected = (socket: Socket, playerName: string): void => {
  const joinChat: ChatMessage = {
    id: chatMessages.length + 1,
    playerName: 'Servidor',
    text: `${playerName} saiu da sala principal`,
  };
  chatMessages.push(joinChat);
  socket.to(mainRoom).emit('receive-message-main-room', joinChat);
};

export default handleSocketActions;
