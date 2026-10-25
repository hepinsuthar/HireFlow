const router = require("express").Router();
const controller = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
router.post("/resume-insights", protect, authorizeRoles("candidate"), controller.resumeInsights);
router.post("/skill-gap-plan", protect, authorizeRoles("candidate"), controller.skillGapActionPlan);
router.post("/interview-questions", protect, authorizeRoles("candidate", "recruiter", "admin"), controller.interviewQuestions);
router.post("/job-description", protect, authorizeRoles("recruiter", "admin"), controller.jobDescription);
module.exports = router;
