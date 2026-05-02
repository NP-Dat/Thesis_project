import { Schema, model } from 'mongoose';

const ResponseSchema = new Schema(
  {
    questionId: { type: Number, required: true },
    section: { type: String, required: true },
    answerLabel: { type: String, required: true },
    answerValue: { type: Number },
    rawValue: { type: Number },
    adjustedValue: { type: Number },
    reverseScored: { type: Boolean, default: false },
  },
  { _id: false }
);

const QuizSubmissionSchema = new Schema(
  {
    mysqlAssessmentId: { type: Number, default: null, index: true },
    mysqlUserId: { type: Number, required: true, index: true },
    quizVersion: { type: Number, required: true },
    responses: { type: [ResponseSchema], required: true },
    personalBurnoutAvg: { type: Number, required: true },
    workBurnoutAvg: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { collection: 'quiz_submissions' }
);

QuizSubmissionSchema.index({ mysqlUserId: 1, submittedAt: -1 });

export const QuizSubmission = model('QuizSubmission', QuizSubmissionSchema);
