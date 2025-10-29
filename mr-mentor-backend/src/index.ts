import { App } from './app';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocket } from './socket';
import cors from 'cors';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  try {
    const appInstance = new App();

    // Initialize DB before creating server (listen method previously did this)
    await appInstance.initializeDatabase();

    const httpServer = createServer(appInstance.app);

    // Configure Socket.IO with similar CORS rules as Express
    const io = new SocketIOServer(httpServer, {
      path: '/socket.io',
      cors: {
        origin: process.env.SOCKET_CORS_ORIGIN
          ? process.env.SOCKET_CORS_ORIGIN.split(',')
          : ['http://localhost:3000', 'http://localhost:5173', '*'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    setupSocket(io);

    httpServer.listen(PORT, HOST, () => {
      console.log(`🚀 Server (HTTP + Socket.IO) running on http://${HOST}:${PORT}`);
      console.log(`🔌 Socket.IO namespace: / (path /socket.io)`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
