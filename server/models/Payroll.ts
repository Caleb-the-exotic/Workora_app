import mongoose, { Schema, type Document } from "mongoose";

export interface IPayroll extends Document {
  employeeId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  monthlyWage: number;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  employerPf: number;
  employeePf: number;
  net: number;
  status: "Processed" | "Pending" | "On hold" | "Paid";
  accuracy: number;
  issues: string[];
  creditedOn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollSchema = new Schema<IPayroll>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    monthlyWage: { type: Number, required: true },
    basic: { type: Number, required: true },
    hra: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    employerPf: { type: Number, default: 0 },
    employeePf: { type: Number, default: 0 },
    net: { type: Number, required: true },
    status: { type: String, enum: ["Processed", "Pending", "On hold", "Paid"], default: "Pending" },
    accuracy: { type: Number, default: 100, min: 0, max: 100 },
    issues: [{ type: String }],
    creditedOn: { type: Date },
  },
  { timestamps: true },
);

PayrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });
PayrollSchema.index({ month: 1, year: 1 });
PayrollSchema.index({ status: 1 });

export const Payroll = mongoose.models.Payroll || mongoose.model<IPayroll>("Payroll", PayrollSchema);
