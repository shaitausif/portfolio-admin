import mongoose, { Schema, Document } from "mongoose";

export interface ExperienceDocument extends Document {
  _id: mongoose.Types.ObjectId;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  description: string[];
  technologies?: string[];
  isCurrentRole: boolean;
  media?: string;
  createdAt: Date;
  updatedAt: Date;
}

const experienceSchema = new Schema<ExperienceDocument>(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    companyLogo: {
      type: String,
      required: false,
    },
    location: {
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
    description: {
      type: [String],
      required: true,
    },
    technologies: {
      type: [String],
      required: false,
    },
    isCurrentRole: {
      type: Boolean,
      default: false,
    },
    media: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const Experience =
  mongoose.models.Experience ||
  mongoose.model<ExperienceDocument>("Experience", experienceSchema);
