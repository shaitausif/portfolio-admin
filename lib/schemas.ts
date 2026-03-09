import { z } from "zod";

// ── Auth Schemas ────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type SignupFormData = z.infer<typeof signupSchema>;

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});
export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export const forgetPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgetPasswordFormData = z.infer<typeof forgetPasswordSchema>;

// ── Portfolio Schemas ───────────────────────────────────

const optionalUrl = z.string().url("Enter a valid URL").or(z.literal(""));

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  bio: z.string().min(1, "Bio is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string(),
  address: z.string(),
  typewriterStrings: z.string().min(1, "Add at least one typewriter string"),
  github: optionalUrl,
  linkedin: optionalUrl,
  twitter: optionalUrl,
  instagram: optionalUrl,
  youtube: optionalUrl,
});
export type ProfileFormData = z.infer<typeof profileSchema>;

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string(),
  description: z.string(),
  grade: z.string(),
});
export type EducationFormData = z.infer<typeof educationSchema>;

export const experienceSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string(),
  description: z.string().min(1, "Add at least one description bullet point"),
  technologies: z.string(),
  isCurrentRole: z.boolean(),
});
export type ExperienceFormData = z.infer<typeof experienceSchema>;

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  liveUrl: optionalUrl,
  githubUrl: optionalUrl,
  featured: z.boolean(),
  order: z.string(),
});
export type ProjectFormData = z.infer<typeof projectSchema>;

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  level: z.number().min(0).max(100),
  category: z.string(),
  description: z.string(),
});
export type SkillFormData = z.infer<typeof skillSchema>;
