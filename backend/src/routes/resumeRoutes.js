const router = require("express").Router();
const controller = require("../controllers/resumeController");
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Candidate-only operations
router.post("/", protect, authorizeRoles("candidate"), upload.single("resume"), controller.uploadResume);
router.post("/upload", protect, authorizeRoles("candidate"), upload.single("resume"), controller.uploadResume);
router.get("/", protect, authorizeRoles("candidate"), controller.listMine);
router.get("/mine", protect, authorizeRoles("candidate"), controller.listMine);
router.delete("/:id", protect, authorizeRoles("candidate"), controller.deleteResume);

// Authorized file access (Candidate owner, Recruiter reviewing application, or Super Admin)
router.get("/:id/file", protect, authorizeRoles("candidate", "recruiter", "admin"), controller.getResumeFile);

module.exports = router;
