export type Difficulty = 'easy' | 'moderate' | 'hard';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Question {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  answer?: string;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface GeneratedPaper {
  title: string;
  subject?: string;
  totalMarks: number;
  durationMinutes?: number;
  sections: Section[];
}

export interface QuestionTypeRequest {
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface Assignment {
  _id: string;
  title: string;
  subject?: string;
  gradeLevel?: string;
  dueDate: string;
  questionTypes: QuestionTypeRequest[];
  additionalInstructions?: string;
  sourceFileName?: string;
  status: AssignmentStatus;
  error?: string;
  paper?: GeneratedPaper;
  groupId?: string;
  savedToLibrary?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSummary {
  _id: string;
  title: string;
  subject?: string;
  status: AssignmentStatus;
  dueDate: string;
  createdAt: string;
  groupId?: string;
  savedToLibrary?: boolean;
}

export type AssignmentEvent =
  | { type: 'status'; status: AssignmentStatus; message?: string }
  | { type: 'completed'; assignmentId: string }
  | { type: 'failed'; assignmentId: string; error: string };
