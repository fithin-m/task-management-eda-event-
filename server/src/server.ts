import app from "./app";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { connectRabbitMQ } from "./events/rabbitmq";
import { initChatSocket } from "./modules/chat/chat.socket";
import { socketAuth } from "./core/middleware/socketAuth";
import { notificationEmitter } from "./modules/notification/notification.emitter";
import { startDeadlineCron } from "./modules/notification/deadline.cron";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Auth middleware for all socket connections
io.use(socketAuth);

//  Wire notification emitter to socket server 
notificationEmitter.init(io);

// Chat + notification socket handlers 
initChatSocket(io);

async function startServer() {
  try {
    try {
      await connectRabbitMQ();
    } catch (err) {
      console.warn("⚠️  RabbitMQ unavailable — skipping message queue:", err);
    }
    startDeadlineCron();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
