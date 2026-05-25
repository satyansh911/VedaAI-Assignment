import { Schema, model, Document } from 'mongoose';

export type AuthProvider = 'credentials' | 'google';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  provider: AuthProvider;
  googleId?: string;
  avatarUrl?: string;
  school?: string;
  schoolLocation?: string;
  preferences: {
    darkMode: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String },
    provider: { type: String, enum: ['credentials', 'google'], required: true },
    googleId: { type: String, index: true, sparse: true },
    avatarUrl: { type: String },
    school: { type: String, default: 'Delhi Public School' },
    schoolLocation: { type: String, default: 'Bokaro Steel City' },
    preferences: {
      darkMode: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User = model<IUser>('User', UserSchema);
