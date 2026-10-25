const Notification = require("../models/Notification");

async function createNotification({ userId, type, title, message, relatedEntityType = "", relatedEntityId = null }) {
  if (!userId) return null;
  const notification = await Notification.create({ userId, type, title, message, relatedEntityType, relatedEntityId });
  const io = global.io;
  if (io) io.to(`user:${userId.toString()}`).emit("notification:new", notification);
  return notification;
}
module.exports = { createNotification };
