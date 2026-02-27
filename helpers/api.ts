import axios from "axios";

const api = axios.create({ baseURL: "/src/api" });

// ── Profile ─────────────────────────────────────────────
export const getProfile = () => api.get("/profile");
export const createProfile = (data: FormData) => api.post("/profile", data);
export const updateProfile = (data: FormData) => api.put("/profile", data);
export const deleteProfile = () => api.delete("/profile");

// ── Experience ──────────────────────────────────────────
export const getExperience = () => api.get("/experience");
export const createExperience = (data: FormData) => api.post("/experience", data);
export const updateExperience = (data: FormData) => api.put("/experience", data);
export const deleteExperience = (_id: string) => api.delete("/experience", { data: { _id } });

// ── Education ───────────────────────────────────────────
export const getEducation = () => api.get("/education");
export const createEducation = (data: FormData) => api.post("/education", data);
export const updateEducation = (data: FormData) => api.put("/education", data);
export const deleteEducation = (_id: string) => api.delete("/education", { data: { _id } });

// ── Skills ──────────────────────────────────────────────
export const getSkills = () => api.get("/skills");
export const createSkill = (data: FormData) => api.post("/skills", data);
export const updateSkill = (data: FormData) => api.put("/skills", data);
export const deleteSkill = (_id: string) => api.delete("/skills", { data: { _id } });

// ── Projects ────────────────────────────────────────────
export const getProjects = () => api.get("/projects");
export const createProject = (data: FormData) => api.post("/projects", data);
export const updateProject = (data: FormData) => api.put("/projects", data);
export const deleteProject = (_id: string) => api.delete("/projects", { data: { _id } });
