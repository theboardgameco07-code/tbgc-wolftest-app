import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { router } from './routes/api.js';
import { seedStocks } from './data/store.js';

seedStocks();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', router);
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
io.on('connection', (s) => s.emit('connected', { ok: true }));
server.listen(process.env.PORT || 4000, () => console.log('backend running'));
