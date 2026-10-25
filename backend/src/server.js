require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const configureSocket = require("./socket");

async function startServer() {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET is missing or shorter than 32 characters. Configure backend/.env.");
    }
    await connectDB();
    const server = http.createServer(app);
    const origins = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((item) => item.trim());
    const io = new Server(server, {
      cors: { origin: origins, credentials: true },
      transports: ["websocket", "polling"]
    });
    global.io = io;
    configureSocket(io);
    const port = Number(process.env.PORT) || 5000;
    server.listen(port, () => console.log(`HireFlow API running at http://localhost:${port}`));
    const shutdown = async () => {
      console.log("Shutting down HireFlow API...");
      io.close();
      server.close(async () => {
        const mongoose = require("mongoose");
        await mongoose.disconnect();
        process.exit(0);
      });
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
  }
}
startServer();
