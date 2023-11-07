import cors from 'cors';
import express from 'express';
import http from 'http';
import { handleSocket } from 'websocket/handleSocket';
import { instrument } from '@socket.io/admin-ui';
import { Server } from 'socket.io';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://admin.socket.io',
      'http://localhost:5173',
      'http://localhost:4000',
      'http://192.168.0.105:5173',
    ],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
});

handleSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
