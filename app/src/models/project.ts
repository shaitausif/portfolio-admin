import mongoose, { Schema, Document } from "mongoose";

export interface ProjectDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  screenshots?: string[];
  technologies: string[];
  liveLink: string;
  githubLink?: string;
  featured: boolean;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<ProjectDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    screenshots: {
      type: [String],
      required: false,
    },
    technologies: {
      type: [String],
      required: true,
    },
    liveLink: {
      type: String,
      required: true,
      trim: true,
    },
    githubLink: {
      type: String,
      required: false,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

export const Project =
  mongoose.models.Project ||
  mongoose.model<ProjectDocument>("Project", projectSchema);
