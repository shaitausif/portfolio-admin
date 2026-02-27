import mongoose, { Schema, Document } from "mongoose";

export interface SkillDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  level: number;
  logo: string;
  category?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<SkillDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    logo: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const Skill =
  mongoose.models.Skill ||
  mongoose.model<SkillDocument>("Skill", skillSchema);
