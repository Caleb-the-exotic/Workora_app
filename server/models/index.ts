import { ObjectId } from "mongodb";
import { connectToDatabase } from "../lib/db";

// ── Types ──────────────────────────────────────────────────────────────────

export interface IUser {
  _id?: ObjectId;
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

export interface IEmployee {
  _id?: ObjectId;
  employeeId: string;
  name: string;
  firstName: string;
  initials: string;
  email: string;
  designation: string;
  department: string;
  manager: string;
  location: string;
  jobType: string;
  phone: string;
  joined: string;
  status: string;
  leaveStatus: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  extra: string;
  monthlyWage: number;
  leaveBalance: { paid: number; sick: number; unpaid: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendance {
  _id?: ObjectId;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: string;
  createdAt: Date;
}

export interface ILeaveRequest {
  _id?: ObjectId;
  employeeId: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: string;
  createdAt: Date;
}

export interface ILeaveBalance {
  _id?: ObjectId;
  employeeId: string;
  paid: number;
  sick: number;
  unpaid: number;
  updatedAt: Date;
}

export interface IPayroll {
  _id?: ObjectId;
  employeeId: string;
  month: string;
  gross: number;
  deductions: number;
  net: number;
  status: string;
  createdAt: Date;
}

export interface INotification {
  _id?: ObjectId;
  employeeId: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: Date;
}

export interface IDocument {
  _id?: ObjectId;
  employeeId: string;
  name: string;
  type: string;
  date: string;
  size: string;
  createdAt: Date;
}

// ── Collection accessors ───────────────────────────────────────────────────

async function col<T>(name: string) {
  const { db } = await connectToDatabase();
  return db.collection<T>(name);
}

export const Users = {
  async find(filter = {}) { return (await col<IUser>("users")).find(filter).toArray(); },
  async findOne(filter: Record<string, unknown>) { return (await col<IUser>("users")).findOne(filter); },
  async insertOne(doc: Omit<IUser, "_id">) { return (await col<IUser>("users")).insertOne({ ...doc } as IUser); },
  async updateOne(filter: Record<string, unknown>, update: Record<string, unknown>) { return (await col<IUser>("users")).updateOne(filter, update); },
  async deleteOne(filter: Record<string, unknown>) { return (await col<IUser>("users")).deleteOne(filter); },
  async createIndexes() {
    const c = await col<IUser>("users");
    await c.createIndex({ email: 1 }, { unique: true });
    await c.createIndex({ employeeId: 1 }, { unique: true });
  },
};

export const Employees = {
  async find(filter = {}) { return (await col<IEmployee>("employees")).find(filter).toArray(); },
  async findOne(filter: Record<string, unknown>) { return (await col<IEmployee>("employees")).findOne(filter); },
  async insertOne(doc: Omit<IEmployee, "_id">) { return (await col<IEmployee>("employees")).insertOne({ ...doc } as IEmployee); },
  async updateOne(filter: Record<string, unknown>, update: Record<string, unknown>) { return (await col<IEmployee>("employees")).updateOne(filter, update); },
  async deleteOne(filter: Record<string, unknown>) { return (await col<IEmployee>("employees")).deleteOne(filter); },
  async createIndexes() {
    const c = await col<IEmployee>("employees");
    await c.createIndex({ employeeId: 1 }, { unique: true });
    await c.createIndex({ email: 1 });
  },
};

export const Attendances = {
  async find(filter = {}) { return (await col<IAttendance>("attendances")).find(filter).toArray(); },
  async findOne(filter: Record<string, unknown>) { return (await col<IAttendance>("attendances")).findOne(filter); },
  async insertOne(doc: Omit<IAttendance, "_id">) { return (await col<IAttendance>("attendances")).insertOne({ ...doc } as IAttendance); },
  async createIndexes() {
    const c = await col<IAttendance>("attendances");
    await c.createIndex({ employeeId: 1, date: 1 });
  },
};

export const LeaveRequests = {
  async find(filter = {}) { return (await col<ILeaveRequest>("leave_requests")).find(filter).toArray(); },
  async insertOne(doc: Omit<ILeaveRequest, "_id">) { return (await col<ILeaveRequest>("leave_requests")).insertOne({ ...doc } as ILeaveRequest); },
  async updateOne(filter: Record<string, unknown>, update: Record<string, unknown>) { return (await col<ILeaveRequest>("leave_requests")).updateOne(filter, update); },
  async createIndexes() {
    const c = await col<ILeaveRequest>("leave_requests");
    await c.createIndex({ employeeId: 1 });
  },
};

export const LeaveBalances = {
  async find(filter = {}) { return (await col<ILeaveBalance>("leave_balances")).find(filter).toArray(); },
  async findOne(filter: Record<string, unknown>) { return (await col<ILeaveBalance>("leave_balances")).findOne(filter); },
  async insertOne(doc: Omit<ILeaveBalance, "_id">) { return (await col<ILeaveBalance>("leave_balances")).insertOne({ ...doc } as ILeaveBalance); },
  async updateOne(filter: Record<string, unknown>, update: Record<string, unknown>) { return (await col<ILeaveBalance>("leave_balances")).updateOne(filter, update); },
};

export const Payrolls = {
  async find(filter = {}) { return (await col<IPayroll>("payrolls")).find(filter).toArray(); },
  async insertOne(doc: Omit<IPayroll, "_id">) { return (await col<IPayroll>("payrolls")).insertOne({ ...doc } as IPayroll); },
  async createIndexes() {
    const c = await col<IPayroll>("payrolls");
    await c.createIndex({ employeeId: 1, month: 1 });
  },
};

export const Notifications = {
  async find(filter = {}) { return (await col<INotification>("notifications")).find(filter).toArray(); },
  async insertOne(doc: Omit<INotification, "_id">) { return (await col<INotification>("notifications")).insertOne({ ...doc } as INotification); },
  async updateOne(filter: Record<string, unknown>, update: Record<string, unknown>) { return (await col<INotification>("notifications")).updateOne(filter, update); },
  async createIndexes() {
    const c = await col<INotification>("notifications");
    await c.createIndex({ employeeId: 1 });
  },
};

export const Documents = {
  async find(filter = {}) { return (await col<IDocument>("documents")).find(filter).toArray(); },
  async insertOne(doc: Omit<IDocument, "_id">) { return (await col<IDocument>("documents")).insertOne({ ...doc } as IDocument); },
  async createIndexes() {
    const c = await col<IDocument>("documents");
    await c.createIndex({ employeeId: 1 });
  },
};
