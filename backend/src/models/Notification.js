const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, required: true, maxlength: 80 },
  title: { type: String, required: true, maxlength: 180 },
  message: { type: String, required: true, maxlength: 1000 },
  relatedEntityType: { type: String, default: "" },
  relatedEntityId: { type: mongoose.Schema.Types.ObjectId, default: null },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
schema.index({ userId: 1, isRead: 1, createdAt: -1 });
module.exports = mongoose.model("Notification", schema);
