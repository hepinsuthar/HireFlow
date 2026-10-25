const jwt = require("jsonwebtoken");
const User = require("../models/User");

function configureSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("_id role isActive");
      if (!user || !user.isActive) return next(new Error("Account not found or disabled"));
      socket.user = { userId: user._id.toString(), role: user.role };
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });
  io.on("connection", (socket) => {
    socket.join(`user:${socket.user.userId}`);
    socket.emit("socket:ready", { success: true });
  });
}
module.exports = configureSocket;
