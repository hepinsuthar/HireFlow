const mongoose = require("mongoose");

const systemSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "global_settings" },
    allowCandidateReg: { type: Boolean, default: true },
    allowRecruiterReg: { type: Boolean, default: true },
    autoApproveJobs: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
    announcement: {
      enabled: { type: Boolean, default: false },
      message: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemSetting", systemSettingSchema);
