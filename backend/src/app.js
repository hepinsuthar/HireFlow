const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const { errorMiddleware } = require("./middleware/errorMiddleware");
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HireFlow API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use(errorMiddleware);
module.exports = app;