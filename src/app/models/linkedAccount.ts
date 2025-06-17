// src/models/LinkedAccount.ts
import { Schema, model, models, Document } from "mongoose";

export interface ILinkedAccount extends Document {
  userId: string;        // NextAuth User._id (as string)
  provider: "google";    // hard-coded for now
  email: string;         // the Gmail address
  accessToken: string;
  refreshToken: string;
  expiresAt: number;     // UNIX timestamp in ms
  createdAt: Date;
  updatedAt: Date;
}

const LinkedAccountSchema = new Schema<ILinkedAccount>(
  {
    userId: { type: String, required: true, index: true },
    provider: { type: String, required: true, default: "google" },
    email: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresAt: { type: Number, required: true },
  },
  { timestamps: true }
);

export const LinkedAccount =
  models.LinkedAccount ||
  model<ILinkedAccount>("LinkedAccount", LinkedAccountSchema);
