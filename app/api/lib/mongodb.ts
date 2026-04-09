/**
 * MongoDB Connection & Schemas
 * Gracefully falls back to in-memory store when MongoDB is not available
 */
import mongoose, { Schema, Document, Model } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/wellness";
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

function isPrivateHost(host: string): boolean {
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  if (host.endsWith(".internal") || host.endsWith(".local")) return true;
  return false;
}

function assertProductionDbSafety() {
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.DB_ALLOW_PUBLIC_ACCESS === "true") return;

  try {
    const hostMatch = MONGODB_URI.match(/mongodb(?:\+srv)?:\/\/(?:[^@/]+@)?([^/?]+)/i);
    if (!hostMatch) return;
    const host = hostMatch[1].split(",")[0].split(":")[0].trim().toLowerCase();
    if (!isPrivateHost(host)) {
      throw new Error("Refusing DB connection: host appears publicly routable. Set DB_ALLOW_PUBLIC_ACCESS=true only if network controls are in place.");
    }
  } catch (err) {
    throw err;
  }
}

// ========== CONNECTION ==========
let isConnected = false;
let connectionAttempted = false;

export async function connectDB(): Promise<boolean> {
  if (isConnected) return true;
  if (connectionAttempted) return isConnected;

  connectionAttempted = true;
  try {
    assertProductionDbSafety();
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log("[MongoDB] Connected");
    return true;
  } catch (err) {
    console.log("[MongoDB] Not available — using in-memory store. To enable MongoDB, run: mongod");
    return false;
  }
}

export function getMongoStatus(): boolean {
  return isConnected;
}

// ========== SCHEMAS ==========

export interface IMood extends Document {
  userId: string;
  mood: string;
  score: number;
  emoji: string;
  note?: string;
  dayOfWeek: number;
  hour: number;
  timestamp: Date;
}

const MoodSchema = new Schema<IMood>({
  userId: { type: String, required: true, index: true },
  mood: { type: String, required: true },
  score: { type: Number, required: true },
  emoji: { type: String, default: "" },
  note: { type: String },
  dayOfWeek: { type: Number, default: 0 },
  hour: { type: Number, default: 12 },
  timestamp: { type: Date, default: Date.now, index: true },
});

export interface ISession extends Document {
  userId: string;
  exerciseId: string;
  title: string;
  type: string;
  duration: number;
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

const SessionSchema = new Schema<ISession>({
  userId: { type: String, required: true, index: true },
  exerciseId: { type: String, default: "" },
  title: { type: String, required: true },
  type: { type: String, required: true },
  duration: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export interface ISleepLog extends Document {
  userId: string;
  hours: number;
  quality: number;
  date: string;
  timestamp: Date;
}

const SleepLogSchema = new Schema<ISleepLog>({
  userId: { type: String, required: true, index: true },
  hours: { type: Number, required: true },
  quality: { type: Number, default: 7 },
  date: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  emailVerified: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  sessionTokenHash?: string;
  sessionExpiresAt?: Date;
  lastLoginAt?: Date;
  joinedDate: Date;
  settings: {
    darkMode: boolean;
    notifications: boolean;
  };
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  emailVerificationTokenHash: { type: String },
  emailVerificationExpiresAt: { type: Date },
  passwordResetTokenHash: { type: String },
  passwordResetExpiresAt: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  sessionTokenHash: { type: String },
  sessionExpiresAt: { type: Date },
  lastLoginAt: { type: Date },
  joinedDate: { type: Date, default: Date.now },
  settings: {
    darkMode: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
  },
});

export interface IWellnessProfile extends Document {
  userId: string;
  name: string;
  age: number;
  gender: string;
  sleepHours: number;
  workHours: number;
  screenTime: number;
  activityLevel: string;
  currentMood: string;
  stressLevel: number;
  anxietyLevel: number;
  meditationFrequency: string;
  exerciseFrequency: string;
  journaling: boolean;
  goals: string[];
  completedAt: Date;
  updatedAt: Date;
}

const WellnessProfileSchema = new Schema<IWellnessProfile>({
  userId: { type: String, required: true, index: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String },
  sleepHours: { type: Number, default: 7 },
  workHours: { type: Number, default: 8 },
  screenTime: { type: Number, default: 4 },
  activityLevel: { type: String, default: "Medium" },
  currentMood: { type: String, required: true },
  stressLevel: { type: Number, default: 5 },
  anxietyLevel: { type: Number, default: 5 },
  meditationFrequency: { type: String, default: "Rarely" },
  exerciseFrequency: { type: String, default: "Rarely" },
  journaling: { type: Boolean, default: false },
  goals: { type: [String], default: [] },
  completedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ========== MODEL EXPORTS ==========
// Use existing model if already compiled (Next.js hot reload safe)
export const MoodModel: Model<IMood> = mongoose.models.Mood || mongoose.model<IMood>("Mood", MoodSchema);
export const SessionModel: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
export const SleepLogModel: Model<ISleepLog> = mongoose.models.SleepLog || mongoose.model<ISleepLog>("SleepLog", SleepLogSchema);
export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const WellnessProfileModel: Model<IWellnessProfile> = mongoose.models.WellnessProfile || mongoose.model<IWellnessProfile>("WellnessProfile", WellnessProfileSchema);

// ========== ML SERVICE CLIENT ==========
export async function callMLService(endpoint: string, data: any): Promise<any> {
  try {
    const res = await fetch(ML_SERVICE_URL + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.log("[ML Service] Error:", res.status, await res.text());
      return null;
    }
    return await res.json();
  } catch (err) {
    console.log("[ML Service] Not available at", ML_SERVICE_URL + endpoint);
    return null;
  }
}

export async function checkMLService(): Promise<boolean> {
  try {
    const res = await fetch(ML_SERVICE_URL + "/health", {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
