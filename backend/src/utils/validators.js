const mongoose = require("mongoose");
const AppError = require("./AppError");

function requireObjectId(id, label = "id") {
  if (!mongoose.isValidObjectId(id)) throw new AppError(`Invalid ${label}.`, 400);
}
function requireString(value, label, min = 1, max = 500) {
  if (typeof value !== "string" || value.trim().length < min || value.trim().length > max) {
    throw new AppError(`${label} must be a string between ${min} and ${max} characters.`, 400);
  }
}
function pick(source, keys) {
  const out = {};
  for (const key of keys) if (Object.prototype.hasOwnProperty.call(source || {}, key)) out[key] = source[key];
  return out;
}
module.exports = { requireObjectId, requireString, pick };
