const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    degree: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    startDate: Date,
    endDate: Date,
    isCurrentlyStudying: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    employmentType: {
      type: String,
      enum: [
        "full-time",
        "part-time",
        "internship",
        "contract",
        "freelance",
      ],
    },
    location: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    startDate: Date,
    endDate: Date,
    isCurrentlyWorking: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    technologies: {
      type: [String],
      default: [],
    },
    projectUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    repositoryUrl: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: true }
);

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    headline: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    education: {
      type: [educationSchema],
      default: [],
    },

    experience: {
      type: [experienceSchema],
      default: [],
    },

    projects: {
      type: [projectSchema],
      default: [],
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },

    profileCompletion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

candidateProfileSchema.index({ userId: 1 }, { unique: true });

const CandidateProfile = mongoose.model(
  "CandidateProfile",
  candidateProfileSchema
);

module.exports = CandidateProfile;