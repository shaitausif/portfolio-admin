import mongoose, { Schema, Document } from "mongoose";

export interface EducationDocument extends Document {
  _id: mongoose.Types.ObjectId;
  institution: string;
  institutionLogo?: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  grade?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const educationSchema = new Schema<EducationDocument>(
  {
    institution: {
      type: String,
      required: true,
      trim: true,
    },
    institutionLogo: {
      type: String,
      required: false,
    },
    degree: {
      type: String,
      required: true,
      trim: true,
    },
    fieldOfStudy: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
    },
    grade: {
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

export const Education =
  mongoose.models.Education ||
  mongoose.model<EducationDocument>("Education", educationSchema);
