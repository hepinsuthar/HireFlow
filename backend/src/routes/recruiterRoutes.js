const router = require("express").Router();
const { getProfile, updateProfile, listCandidates } = require("../controllers/recruiterController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
router.use(protect, authorizeRoles("recruiter", "admin"));
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/candidates", listCandidates);
module.exports = router;
