import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalFilename: {
      type: String,
      default: 'resume.pdf',
    },
    extractedText: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceSummary: {
      type: String,
      default: '',
    },
    filePath: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    isScannedOrEmpty: {
      type: Boolean,
      default: false,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Resume = mongoose.model('Resume', resumeSchema);
