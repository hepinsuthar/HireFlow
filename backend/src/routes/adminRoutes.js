const router = require("express").Router();
const controller = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.use(protect, authorizeRoles("admin"));

// Users & Recruiters
router.get("/users", controller.listUsers);
router.patch("/users/:id/active", controller.setUserActive);
router.get("/recruiters", controller.listRecruiters);

// Companies
router.get("/companies", controller.listCompanies);
router.patch("/companies/:id/verify", controller.verifyCompany);

// Jobs moderation
router.get("/jobs", controller.listJobsForModeration);
router.patch("/jobs/:id/moderate", controller.moderateJob);

// Applications audit
router.get("/applications", controller.listApplications);

// System Reports & Analytics
router.get("/reports", controller.getPlatformReports);

// Platform System Settings
router.get("/settings", controller.getSettings);
router.patch("/settings", controller.updateSettings);

module.exports = router;
