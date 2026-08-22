import mongoose, { Schema, type Document } from "mongoose";

export interface ILeaveBalance extends Document {
  employeeId: mongoose.Types.ObjectId;
  year: number;
  casual: { used: number; total: number };
  sick: { used: number; total: number };
  earned: { used: number; total: number };
  compOff: { used: number; total: number };
  unpaid: { used: number; total: number };
  createdAt: Date;
  updatedAt: Date;
}

const LeaveBalanceSchema = new Schema<ILeaveBalance>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    year: { type: Number, required: true },
    casual: {
      used: { type: Number, default: 0 },
      total: { type: Number, default: 12 },
    },
    sick: {
      used: { type: Number, default: 0 },
      total: { type: Number, default: 6 },
    },
    earned: {
      used: { type: Number, default: 0 },
      total: { type: Number, default: 15 },
    },
    compOff: {
      used: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    unpaid: {
      used: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

LeaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });

export const LeaveBalance =
  mongoose.models.LeaveBalance || mongoose.model<ILeaveBalance>("LeaveBalance", LeaveBalanceSchema);
