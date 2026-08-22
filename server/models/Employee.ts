import mongoose, { Schema, type Document } from "mongoose";

export interface IEmployee extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  name: string;
  firstName: string;
  initials: string;
  email: string;
  personalEmail?: string;
  phone: string;
  designation: string;
  department: string;
  role: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Intern";
  location: string;
  manager: string;
  dateOfJoining: Date;
  dateOfBirth?: Date;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  address?: string;
  emergencyContact?: string;
  employmentType: string;
  shift: string;
  workingDays: number;
  status: "Active" | "Inactive" | "Onboarding";
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    initials: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    personalEmail: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    jobType: { type: String, enum: ["Full-time", "Part-time", "Contract", "Intern"], default: "Full-time" },
    location: { type: String, required: true, trim: true },
    manager: { type: String, required: true, trim: true },
    dateOfJoining: { type: Date, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String },
    maritalStatus: { type: String },
    nationality: { type: String },
    address: { type: String },
    emergencyContact: { type: String },
    employmentType: { type: String, default: "Full-time" },
    shift: { type: String, default: "General — 09:30 to 18:30" },
    workingDays: { type: Number, default: 5 },
    status: { type: String, enum: ["Active", "Inactive", "Onboarding"], default: "Active" },
  },
  { timestamps: true },
);

EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ manager: 1 });
EmployeeSchema.index({ userId: 1 });

export const Employee = mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);
