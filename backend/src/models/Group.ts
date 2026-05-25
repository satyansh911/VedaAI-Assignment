import { Schema, model, Document, Types } from 'mongoose';

export interface IGroup extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  gradeLevel?: string;
  subject?: string;
  studentCount: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const PALETTE = ['#FB7C30', '#4F46E5', '#10B981', '#EC4899', '#0EA5E9', '#F59E0B'];

const GroupSchema = new Schema<IGroup>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    gradeLevel: { type: String },
    subject: { type: String },
    studentCount: { type: Number, default: 0, min: 0 },
    color: { type: String, default: () => PALETTE[Math.floor(Math.random() * PALETTE.length)] },
  },
  { timestamps: true },
);

export const Group = model<IGroup>('Group', GroupSchema);
