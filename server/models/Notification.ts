import mongoose, { Schema, type Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  category: "approval" | "leave" | "attendance" | "payroll" | "system";
  title: string;
  body: string;
  time: string;
  timestamp: Date;
  unread: boolean;
  actionUrl?: string;
  actionLabel?: string;
  actor?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["approval", "leave", "attendance", "payroll", "system"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    time: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
    unread: { type: Boolean, default: true },
    actionUrl: { type: String },
    actionLabel: { type: String },
    actor: { type: String },
  },
  { timestamps: true },
);

NotificationSchema.index({ userId: 1, unread: 1 });
NotificationSchema.index({ userId: 1, timestamp: -1 });
NotificationSchema.index({ category: 1 });

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
