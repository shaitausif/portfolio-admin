export interface ProfileInterface {
  _id: string;
  userId: string;
  name: string;
  bio: string;
  photo?: string;
  resume?: string;
  skills: SkillInterface[];
  projects: ProjectInterface[];
  experience: ExperienceInterface[];
  education: EducationInterface[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInterface {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  link: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceInterface {
  _id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
  media?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillInterface {
  _id: string;
  name: string;
  level: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EducationInterface {
  _id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
