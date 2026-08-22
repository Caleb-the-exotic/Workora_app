import mongoose, { Schema, type Document } from "mongoose";

export interface IDocument extends Document {
  employeeId: mongoose.Types.ObjectId;
  name: string;
  size: string;
  uploaded: Date;
  type: "Onboarding" | "Identity" | "Tax" | "Offer" | "Experience" | "Other";
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    name: { type: String, required: true, trim: true },
    size: { type: String, default: "" },
    uploaded: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ["Onboarding", "Identity", "Tax", "Offer", "Experience", "Other"],
      default: "Other",
    },
    fileUrl: { type: String, required: true },
  },
  { timestamps: true },
);

DocumentSchema.index({ employeeId: 1, type: 1 });

export const Document =
  mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);
