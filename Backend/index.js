import express from 'express';
import http from 'http';
import app from './App.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 5050;
const server = http.createServer(app);

initSocket(server);

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

export default app;