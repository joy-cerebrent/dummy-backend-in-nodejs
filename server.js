import express from 'express';
import { Server as ServerIO } from 'socket.io';
import http from 'http';
import cors from 'cors';
import socketRoutes from './routes/socket.route.js';
import movieRoutes from './routes/movie.route.js';
import authRoutes from './routes/auth.route.js';
import dashboardRoutes from './routes/dashboard.route.js';
import { readData, writeData } from './utils/fileUtils.js';

const app = express();
const server = http.createServer(app);
const io = new ServerIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const corsOptions = {
  credentials: true,
  origin: [
    'http://localhost:3000',
    'http://localhost:5173'
  ],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/socket', socketRoutes(io));
app.use('/api/movie', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.emit('dataUpdated', readData());

  socket.on('updateData', (newData) => {
    console.log('Received data for update:', newData);
    writeData(newData);
    io.emit('dataUpdated', newData);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => console.log('Backend running at http://localhost:4000'));
