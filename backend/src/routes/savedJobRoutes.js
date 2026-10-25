const router = require("express").Router();
const controller = require("../controllers/savedJobController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.use(protect, authorizeRoles("candidate"));
router.get("/", controller.listSavedJobs);
router.post("/", controller.saveJob);
router.post("/toggle/:jobId", controller.toggleSavedJob);
router.delete("/:jobId", controller.removeSavedJob);

module.exports = router;
