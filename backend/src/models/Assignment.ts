import { Schema, model, Document, Types } from 'mongoose';

export type Difficulty = 'easy' | 'moderate' | 'hard';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IQuestion {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  answer?: string;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IGeneratedPaper {
  title: string;
  subject?: string;
  totalMarks: number;
  durationMinutes?: number;
  sections: ISection[];
}

export interface IQuestionTypeRequest {
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface IAssignment extends Document {
  userId: Types.ObjectId;
  groupId?: Types.ObjectId;
  title: string;
  subject?: string;
  gradeLevel?: string;
  dueDate: Date;
  questionTypes: IQuestionTypeRequest[];
  additionalInstructions?: string;
  sourceText?: string;
  sourceFileName?: string;
  status: AssignmentStatus;
  error?: string;
  paper?: IGeneratedPaper;
  jobId?: string;
  savedToLibrary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'moderate', 'hard'], required: true },
    marks: { type: Number, required: true },
    answer: { type: String, required: false },
  },
  { _id: false },
);

const SectionSchema = new Schema<ISection>(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionSchema], default: [] },
  },
  { _id: false },
);

const PaperSchema = new Schema<IGeneratedPaper>(
  {
    title: { type: String, required: true },
    subject: String,
    totalMarks: { type: Number, required: true },
    durationMinutes: Number,
    sections: { type: [SectionSchema], default: [] },
  },
  { _id: false },
);

const QuestionTypeRequestSchema = new Schema<IQuestionTypeRequest>(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', index: true },
    title: { type: String, required: true },
    subject: String,
    gradeLevel: String,
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeRequestSchema], required: true },
    additionalInstructions: String,
    sourceText: String,
    sourceFileName: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    error: String,
    paper: PaperSchema,
    jobId: String,
    savedToLibrary: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Assignment = model<IAssignment>('Assignment', AssignmentSchema);
