function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}
function errorMiddleware(err, req, res, next) {
  if (res.headersSent) return next(err);
  let statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  let message = err.message || "Internal server error.";
  if (err.name === "ValidationError" || err.name === "CastError") {
    statusCode = 400;
    message = err.name === "ValidationError"
      ? Object.values(err.errors).map((item) => item.message).join(", ")
      : "Invalid identifier or value.";
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this unique value already exists.";
  }
  if (statusCode >= 500) {
    console.error(err);
    message = process.env.NODE_ENV === "development" ? message : "Internal server error.";
  }
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && statusCode >= 500 ? { debugMessage: err.message } : {})
  });
}
module.exports = { notFound, errorMiddleware };
