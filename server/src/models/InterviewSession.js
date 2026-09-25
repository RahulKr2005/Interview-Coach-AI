import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question_index: {
    type: Number,
    required: true,
  },
  question_text: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    default: 'General Technical',
  },
  reference_answer: {
    type: String,
    default: '',
  },
  checklist: {
    type: [String],
    default: [],
  },
  user_answer: {
    type: String,
    default: null,
  },
  feedback: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  score: {
    type: Number,
    default: null,
  },
  skipped: {
    type: Boolean,
    default: false,
  },
  answered_at: {
    type: Date,
    default: null,
  },
});

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    target_role: {
      type: String,
      required: true,
    },
    interview_type: {
      type: String,
      default: 'Technical',
      enum: ['Technical', 'HR', 'Resume-Based'],
    },
    difficulty: {
      type: String,
      default: 'Intermediate',
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    question_count: {
      type: Number,
      default: 5,
    },
    status: {
      type: String,
      default: 'in_progress',
      enum: ['in_progress', 'completed'],
    },
    mode: {
      type: String,
      default: 'Basic Practice Mode',
    },
    input_mode: {
      type: String,
      default: 'text',
      enum: ['text', 'voice'],
    },
    current_question_index: {
      type: Number,
      default: 1,
    },
    completed_at: {
      type: Date,
      default: null,
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
