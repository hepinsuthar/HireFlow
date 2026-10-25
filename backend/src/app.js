const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { protect } = require("./middleware/authMiddleware");
const { notFound, errorMiddleware } = require("./middleware/errorMiddleware");

const app = express();
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: allowedOrigin.split(",").map((item) => item.trim()), credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/api/health", (req, res) => res.status(200).json({
  success: true, message: "HireFlow API is running", timestamp: new Date().toISOString()
}));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/candidates", require("./routes/candidateRoutes"));
app.use("/api/recruiters", require("./routes/recruiterRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/resumes", require("./routes/resumeRoutes"));
app.use("/api/interviews", require("./routes/interviewRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/saved-jobs", require("./routes/savedJobRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
