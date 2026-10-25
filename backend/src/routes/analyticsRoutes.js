const router = require("express").Router();
const { candidateAnalytics, recruiterAnalytics, adminAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.get("/candidate", protect, authorizeRoles("candidate"), candidateAnalytics);
router.get("/recruiter", protect, authorizeRoles("recruiter", "admin"), recruiterAnalytics);
router.get("/admin", protect, authorizeRoles("admin"), adminAnalytics);

module.exports = router;
