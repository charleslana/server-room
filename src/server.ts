import cors from 'cors';
import express from 'express';
import http from 'http';
import logger from 'utils/logger';
import { configureSockets } from 'websocket';
import { instrument } from '@socket.io/admin-ui';
import { Server } from 'socket.io';

const app = express();
app.use(cors());
const server = http.createServer(app);
const corsOriginUrls = process.env.CORS_ORIGIN_URLS as string;
const corsOriginUrlsArray = corsOriginUrls.split(',');
const io = new Server(server, {
  cors: {
    origin: corsOriginUrlsArray,
    credentials: true,
  },
});

instrument(io, {
  auth: false,
});

configureSockets(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
