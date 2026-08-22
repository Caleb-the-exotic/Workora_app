import mongoose, { Schema, type Document } from "mongoose";

export interface ILeaveRequest extends Document {
  employeeId: mongoose.Types.ObjectId;
  leaveId: string;
  type: "Casual leave" | "Sick leave" | "Earned leave" | "Comp-off" | "Paid time off" | "Unpaid leave";
  from: Date;
  to: Date;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedOn: Date;
  attachment?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  remarks?: string;
  balanceAfter: {
    paid: number;
    sick: number;
    unpaid: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    leaveId: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["Casual leave", "Sick leave", "Earned leave", "Comp-off", "Paid time off", "Unpaid leave"],
      required: true,
    },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    days: { type: Number, required: true, min: 0.5 },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    appliedOn: { type: Date, default: Date.now },
    attachment: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Employee" },
    reviewedAt: { type: Date },
    remarks: { type: String },
    balanceAfter: {
      paid: { type: Number, default: 0 },
      sick: { type: Number, default: 0 },
      unpaid: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

LeaveRequestSchema.index({ employeeId: 1, status: 1 });
LeaveRequestSchema.index({ leaveId: 1 });
LeaveRequestSchema.index({ status: 1 });
LeaveRequestSchema.index({ appliedOn: -1 });

export const LeaveRequest =
  mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);
