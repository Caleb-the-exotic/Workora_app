import mongoose, { Schema, type Document } from "mongoose";

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: "Present" | "Absent" | "Half-day" | "On leave" | "Late" | "Work from home";
  hours?: string;
  overtime?: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ["Present", "Absent", "Half-day", "On leave", "Late", "Work from home"],
      default: "Absent",
    },
    hours: { type: String },
    overtime: { type: Number, default: 0 },
    remarks: { type: String },
  },
  { timestamps: true },
);

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ status: 1 });

export const Attendance =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
