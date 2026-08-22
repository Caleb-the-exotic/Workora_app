import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  employeeId: string;
  email: string;
  password: string;
  role: "employee" | "hr";
  verified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["employee", "hr"], default: "employee" },
    verified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 });
UserSchema.index({ employeeId: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
