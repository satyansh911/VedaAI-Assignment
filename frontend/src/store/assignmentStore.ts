import { create } from 'zustand';
import { Assignment, AssignmentStatus, QuestionTypeRequest } from '@/types/assignment';

export interface FormState {
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate: string;
  questionTypes: QuestionTypeRequest[];
  additionalInstructions: string;
  file: File | null;
  groupId: string;
}

interface AssignmentStore {
  form: FormState;
  setForm: (patch: Partial<FormState>) => void;
  setQuestionType: (index: number, patch: Partial<QuestionTypeRequest>) => void;
  addQuestionType: () => void;
  removeQuestionType: (index: number) => void;
  resetForm: () => void;

  current: Assignment | null;
  setCurrent: (a: Assignment | null) => void;
  setStatus: (status: AssignmentStatus, error?: string) => void;
}

const defaultForm: FormState = {
  title: '',
  subject: '',
  gradeLevel: '',
  dueDate: '',
  questionTypes: [{ type: 'Multiple Choice', count: 5, marksPerQuestion: 2 }],
  additionalInstructions: '',
  file: null,
  groupId: '',
};

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  form: defaultForm,
  setForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
  setQuestionType: (index, patch) =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: s.form.questionTypes.map((qt, i) =>
          i === index ? { ...qt, ...patch } : qt,
        ),
      },
    })),
  addQuestionType: () =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: [
          ...s.form.questionTypes,
          { type: 'Short Answer', count: 3, marksPerQuestion: 5 },
        ],
      },
    })),
  removeQuestionType: (index) =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: s.form.questionTypes.filter((_, i) => i !== index),
      },
    })),
  resetForm: () => set({ form: defaultForm }),

  current: null,
  setCurrent: (a) => set({ current: a }),
  setStatus: (status, error) =>
    set((s) =>
      s.current
        ? { current: { ...s.current, status, error: error ?? s.current.error } }
        : s,
    ),
}));
