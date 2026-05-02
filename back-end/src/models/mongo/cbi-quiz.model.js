import { Schema, model } from 'mongoose';

const ResponseOptionSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: Number, required: true },
  },
  { _id: false }
);

const SectionSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    questionIds: { type: [Number], required: true },
  },
  { _id: false }
);

const QuestionSchema = new Schema(
  {
    id: { type: Number, required: true },
    section: { type: String, required: true },
    text: { type: String, required: true },
    reverseScored: { type: Boolean, default: false },
  },
  { _id: false }
);

const CbiQuizSchema = new Schema(
  {
    name: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
    responseOptions: { type: [ResponseOptionSchema], required: true },
    sections: { type: [SectionSchema], required: true },
    questions: { type: [QuestionSchema], required: true },
    isActive: { type: Boolean, default: true },
  },
  { collection: 'cbi_questions', timestamps: true }
);

CbiQuizSchema.index({ isActive: 1, version: -1 });

export const CbiQuiz = model('CbiQuiz', CbiQuizSchema);
