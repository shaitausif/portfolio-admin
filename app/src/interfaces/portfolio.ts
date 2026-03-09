export interface SocialLinksInterface {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface ProfileInterface {
  _id: string;
  userId: string;
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
  skills: SkillInterface[];
  projects: ProjectInterface[];
  experience: ExperienceInterface[];
  education: EducationInterface[];
  createdAt: string;
  updatedAt: string;
}

export interface TechStackItemInterface {
  name: string;
  image: string;
}

export interface ProjectInterface {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  screenshots?: string[];
  techStack: TechStackItemInterface[];
  liveUrl: string;
  githubUrl?: string;
  featured: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceInterface {
  _id: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string[];
  technologies?: string[];
  isCurrentRole: boolean;
  media?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillInterface {
  _id: string;
  name: string;
  level: number;
  logo: string;
  category?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EducationInterface {
  _id: string;
  institution: string;
  institutionLogo?: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
