const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = { userId: req.user.userId };
  if (req.query.unread === "true") filter.isRead = false;
  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user.userId, isRead: false })
  ]);
  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, unread });
});
const markRead = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { isRead: true }, { new: true });
  if (!item) throw new AppError("Notification not found.", 404);
  res.json({ success: true, data: item });
});
const markAllRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany({ userId: req.user.userId, isRead: false }, { isRead: true });
  res.json({ success: true, message: "All notifications marked as read.", data: { modifiedCount: result.modifiedCount } });
});
module.exports = { list, markRead, markAllRead };
