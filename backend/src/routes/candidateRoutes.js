const router = require("express").Router();
const controller = require("../controllers/candidateController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.use(protect);

// Recruiter & Admin candidate talent directory
router.get("/", authorizeRoles("recruiter", "admin"), controller.listCandidates);

// Candidate workspace endpoints
router.get("/profile", authorizeRoles("candidate"), controller.getProfile);
router.put("/profile", authorizeRoles("candidate"), controller.updateProfile);
router.get("/applications", authorizeRoles("candidate"), controller.myApplications);

// Candidate Skill Evidence endpoints
router.get("/evidence", authorizeRoles("candidate"), controller.getSkillEvidence);
router.post("/evidence", authorizeRoles("candidate"), controller.addSkillEvidence);
router.put("/evidence/:id", authorizeRoles("candidate"), controller.updateSkillEvidence);
router.delete("/evidence/:id", authorizeRoles("candidate"), controller.deleteSkillEvidence);

module.exports = router;
