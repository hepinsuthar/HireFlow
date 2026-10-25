const multer = require("multer");
const AppError = require("../utils/AppError");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, cb) {
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.mimetype)) return cb(new AppError("Resume must be a PDF, DOC, or DOCX file.", 400));
    cb(null, true);
  }
});
module.exports = upload;
