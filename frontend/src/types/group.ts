import { AssignmentSummary } from './assignment';

export interface Group {
  _id: string;
  name: string;
  description?: string;
  gradeLevel?: string;
  subject?: string;
  studentCount: number;
  color: string;
  assignmentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupDetail extends Group {
  assignments: AssignmentSummary[];
}
