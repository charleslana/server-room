import cors from 'cors';
import express from 'express';
import handleSocketActions from 'websocket/socketActions';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

handleSocketActions(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
