const router = require("express").Router();
const ContactInquiry = require("../models/ContactInquiry");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, role, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      throw new AppError("Name, email, subject, and message are required fields.", 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Invalid email address format.", 400);
    }

    const inquiry = await ContactInquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: ["candidate", "recruiter", "employer", "other"].includes(role) ? role : "candidate",
      subject: subject.trim(),
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      message: "Thank you for reaching out! A HireFlow specialist will respond within 24 business hours.",
      data: { id: inquiry._id }
    });
  })
);

module.exports = router;
