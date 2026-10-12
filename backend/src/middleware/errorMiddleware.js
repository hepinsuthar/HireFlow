const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error."
        : err.message || "Request failed.",
  };

  if (process.env.NODE_ENV === "development" && statusCode >= 500) {
    response.debugMessage = err.message;
  }

  res.status(statusCode).json(response);
};

module.exports = { errorMiddleware };