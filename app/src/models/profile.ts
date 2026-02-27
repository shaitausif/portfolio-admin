import mongoose, { Schema, Document } from "mongoose";

export interface SocialLinksInterface {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface ProfileDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  role: string;
  bio: string;
  typewriterStrings: string[];
  email: string;
  phone?: string;
  address?: string;
  socialLinks?: SocialLinksInterface;
  photo?: string;
  heroImage?: string;
  resume?: string;
  skills: mongoose.Types.ObjectId[];
  projects: mongoose.Types.ObjectId[];
  experience: mongoose.Types.ObjectId[];
  education: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<ProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      required: true,
    },
    typewriterStrings: {
      type: [String],
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    socialLinks: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      instagram: { type: String, trim: true },
      youtube: { type: String, trim: true },
    },
    photo: {
      type: String,
      required: false,
    },
    heroImage: {
      type: String,
      required: false,
    },
    resume: {
      type: String,
      required: false,
    },
    skills: [
      {
        type: Schema.Types.ObjectId,
        ref: "Skill",
        required: false,
      },
    ],
    projects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: false,
      },
    ],
    experience: [
      {
        type: Schema.Types.ObjectId,
        ref: "Experience",
        required: false,
      },
    ],
    education: [
      {
        type: Schema.Types.ObjectId,
        ref: "Education",
        required: false,
      },
    ],
  },
  { timestamps: true }
);

export const Profile =
  mongoose.models.Profile ||
  mongoose.model<ProfileDocument>("Profile", profileSchema);
