import mongoose, { Schema, Document } from "mongoose";

export interface TechStackItem {
  name: string;
  image: string;
}

export interface ProjectDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  screenshots?: string[];
  techStack: TechStackItem[];
  liveUrl: string;
  githubUrl?: string;
  featured: boolean;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const techStackItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

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
    techStack: {
      type: [techStackItemSchema],
      required: true,
    },
    liveUrl: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    githubUrl: {
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

// Delete cached model to pick up schema changes during hot-reload
if (mongoose.models.Project) {
  delete mongoose.models.Project;
}

export const Project = mongoose.model<ProjectDocument>("Project", projectSchema);
