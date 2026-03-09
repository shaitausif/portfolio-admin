"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { motion } from "motion/react";
import Modal from "./Modal";
import { requestHandler } from "@/app/src/utils";
import {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
} from "@/helpers/api";
import { profileSchema, type ProfileFormData } from "@/lib/schemas";

interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

interface ProfileData {
  _id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  resume: string;
  typewriterStrings: string[];
  email: string;
  phone?: string;
  address?: string;
  socialLinks?: SocialLinks;
  heroImage?: string;
}

export default function ProfileSection() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // File state (not managed by react-hook-form)
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);
  const heroImageRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const fetchProfile = async () => {
    await requestHandler(
      getProfile,
      setLoading,
      (res) => setProfile(res.data),
      () => setProfile(null)
    );
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const resetFileState = () => {
    setPhotoFile(null); setResumeFile(null); setHeroImageFile(null);
    setPhotoPreview(null); setHeroImagePreview(null);
    if (photoRef.current) photoRef.current.value = "";
    if (resumeRef.current) resumeRef.current.value = "";
    if (heroImageRef.current) heroImageRef.current.value = "";
  };

  const openCreate = () => {
    setIsEdit(false);
    reset({ name: "", role: "", bio: "", email: "", phone: "", address: "", typewriterStrings: "", github: "", linkedin: "", twitter: "", instagram: "", youtube: "" });
    resetFileState();
    setModalOpen(true);
  };

  const openEdit = () => {
    if (!profile) return;
    setIsEdit(true);
    reset({
      name: profile.name,
      role: profile.role || "",
      bio: profile.bio,
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || "",
      typewriterStrings: profile.typewriterStrings?.join("\n") || "",
      github: profile.socialLinks?.github || "",
      linkedin: profile.socialLinks?.linkedin || "",
      twitter: profile.socialLinks?.twitter || "",
      instagram: profile.socialLinks?.instagram || "",
      youtube: profile.socialLinks?.youtube || "",
    });
    resetFileState();
    setPhotoPreview(profile.photo || null);
    setHeroImagePreview(profile.heroImage || null);
    setModalOpen(true);
  };

  const handleDeleteProfile = async () => {
    if (!confirm("Are you sure you want to delete your entire profile? This cannot be undone.")) return;
    await requestHandler(
      deleteProfile,
      null,
      (res) => {
        toast.success(res.message);
        setProfile(null);
      },
      (err) => toast.error(err)
    );
  };

  const onSubmit = async (data: ProfileFormData) => {
    const twStrings = data.typewriterStrings.split("\n").map((s) => s.trim()).filter(Boolean);
    if (twStrings.length === 0) {
      toast.error("Add at least one typewriter string");
      return;
    }

    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("role", data.role);
    fd.append("bio", data.bio);
    fd.append("email", data.email);
    fd.append("phone", data.phone || "");
    fd.append("address", data.address || "");
    fd.append("typewriterStrings", JSON.stringify(twStrings));
    if (photoFile) fd.append("photo", photoFile);
    if (resumeFile) fd.append("resume", resumeFile);
    if (heroImageFile) fd.append("heroImage", heroImageFile);

    fd.append("socialLinks", JSON.stringify({
      github: data.github || "",
      linkedin: data.linkedin || "",
      twitter: data.twitter || "",
      instagram: data.instagram || "",
      youtube: data.youtube || "",
    }));

    const apiCall = isEdit ? () => updateProfile(fd) : () => createProfile(fd);

    await requestHandler(
      apiCall,
      null,
      (res) => {
        toast.success(res.message);
        setProfile(res.data);
        setModalOpen(false);
      },
      (err) => toast.error(err)
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  if (loading) {
    return <SectionShell title="Profile"><p className="text-zinc-500">Loading...</p></SectionShell>;
  }

  return (
    <SectionShell title="Profile">
      {profile ? (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">{profile.name}</h2>
              {profile.role && <p className="text-sm font-medium text-zinc-600">{profile.role}</p>}
              <p className="mt-1 text-zinc-600 whitespace-pre-line">{profile.bio}</p>
            </div>
            <div className="flex gap-2 shrink-0 self-start">
              <motion.button
                onClick={openEdit}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Edit Profile
              </motion.button>
              <motion.button
                onClick={handleDeleteProfile}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors cursor-pointer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Delete
              </motion.button>
            </div>
          </div>

          {profile.photo && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <img
                src={profile.photo}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border border-zinc-200"
              />
              <span className="text-xs font-medium text-zinc-500 uppercase">Photo</span>
            </motion.div>
          )}
          {profile.heroImage && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
              className="flex items-center gap-4"
            >
              <img
                src={profile.heroImage}
                alt="Hero"
                className="w-28 h-16 rounded-md object-cover border border-zinc-200"
              />
              <span className="text-xs font-medium text-zinc-500 uppercase">Hero Image</span>
            </motion.div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {profile.email && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}>
                <span className="text-xs font-medium text-zinc-500 uppercase">Email</span>
                <p className="text-zinc-800">{profile.email}</p>
              </motion.div>
            )}
            {profile.phone && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}>
                <span className="text-xs font-medium text-zinc-500 uppercase">Phone</span>
                <p className="text-zinc-800">{profile.phone}</p>
              </motion.div>
            )}
            {profile.address && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}>
                <span className="text-xs font-medium text-zinc-500 uppercase">Address</span>
                <p className="text-zinc-800">{profile.address}</p>
              </motion.div>
            )}
          </div>
          {profile.typewriterStrings && profile.typewriterStrings.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <span className="text-xs font-medium text-zinc-500 uppercase">Typewriter Strings</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.typewriterStrings.map((s, idx) => (
                  <span key={idx} className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">{s}</span>
                ))}
              </div>
            </motion.div>
          )}
          {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}>
              <span className="text-xs font-medium text-zinc-500 uppercase">Social Links</span>
              <div className="flex flex-wrap gap-3 mt-1">
                {profile.socialLinks.github && <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">GitHub</a>}
                {profile.socialLinks.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">LinkedIn</a>}
                {profile.socialLinks.twitter && <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Twitter</a>}
                {profile.socialLinks.instagram && <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Instagram</a>}
                {profile.socialLinks.youtube && <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">YouTube</a>}
              </div>
            </motion.div>
          )}
          {profile.resume && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <span className="text-xs font-medium text-zinc-500 uppercase">Resume</span>
              <a
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:underline mt-0.5"
              >
                View / Download Resume
              </a>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <p className="text-zinc-500 mb-4">No profile created yet.</p>
          <motion.button
            onClick={openCreate}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
            whileTap={{ scale: 0.96 }}
          >
            Create Profile
          </motion.button>
        </motion.div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? "Edit Profile" : "Create Profile"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Name" required>
            <input
              type="text"
              {...register("name")}
              className="input-field"
              placeholder="Your full name"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </Field>
          <Field label="Role" required>
            <input
              type="text"
              {...register("role")}
              className="input-field"
              placeholder="e.g. Full Stack Developer"
            />
            {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>}
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              {...register("email")}
              className="input-field"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </Field>
          <Field label="Bio" required>
            <textarea
              {...register("bio")}
              className="input-field min-h-24 resize-y"
              placeholder="A short bio about yourself"
            />
            {errors.bio && <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>}
          </Field>
          <Field label="Typewriter Strings (one per line)" required>
            <textarea
              {...register("typewriterStrings")}
              className="input-field min-h-20 resize-y"
              placeholder={"Full Stack Developer\nUI/UX Designer\nOpen Source Contributor"}
            />
            {errors.typewriterStrings && <p className="text-sm text-red-600 mt-1">{errors.typewriterStrings.message}</p>}
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone">
              <input type="tel" {...register("phone")} className="input-field" placeholder="+1 234 567 890" />
            </Field>
            <Field label="Address">
              <input type="text" {...register("address")} className="input-field" placeholder="City, Country" />
            </Field>
          </div>
          <Field label="Photo">
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover border border-zinc-200 mb-2"
              />
            )}
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="input-field file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 file:cursor-pointer"
            />
          </Field>
          <Field label="Resume">
            {isEdit && profile?.resume && (
              <a
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline mb-1 inline-block"
              >
                Current resume
              </a>
            )}
            <input
              ref={resumeRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="input-field file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 file:cursor-pointer"
            />
          </Field>
          <Field label="Hero Image">
            {heroImagePreview && (
              <img
                src={heroImagePreview}
                alt="Hero Preview"
                className="w-full max-w-xs h-24 rounded-md object-cover border border-zinc-200 mb-2"
              />
            )}
            <input
              ref={heroImageRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setHeroImageFile(f);
                setHeroImagePreview(f ? URL.createObjectURL(f) : heroImagePreview);
              }}
              className="input-field file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 file:cursor-pointer"
            />
          </Field>
          <div className="border-t border-zinc-200 pt-4 mt-4">
            <h3 className="text-sm font-semibold text-zinc-700 mb-3">Social Links</h3>
            <div className="space-y-3">
              <Field label="GitHub">
                <input type="url" {...register("github")} className="input-field" placeholder="https://github.com/username" />
                {errors.github && <p className="text-sm text-red-600 mt-1">{errors.github.message}</p>}
              </Field>
              <Field label="LinkedIn">
                <input type="url" {...register("linkedin")} className="input-field" placeholder="https://linkedin.com/in/username" />
                {errors.linkedin && <p className="text-sm text-red-600 mt-1">{errors.linkedin.message}</p>}
              </Field>
              <Field label="Twitter">
                <input type="url" {...register("twitter")} className="input-field" placeholder="https://twitter.com/username" />
                {errors.twitter && <p className="text-sm text-red-600 mt-1">{errors.twitter.message}</p>}
              </Field>
              <Field label="Instagram">
                <input type="url" {...register("instagram")} className="input-field" placeholder="https://instagram.com/username" />
                {errors.instagram && <p className="text-sm text-red-600 mt-1">{errors.instagram.message}</p>}
              </Field>
              <Field label="YouTube">
                <input type="url" {...register("youtube")} className="input-field" placeholder="https://youtube.com/@channel" />
                {errors.youtube && <p className="text-sm text-red-600 mt-1">{errors.youtube.message}</p>}
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <motion.button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {isEdit ? "Update" : "Create"}
            </motion.button>
          </div>
        </form>
      </Modal>
    </SectionShell>
  );
}

/* ── Shared helpers ────────────────────────────────────── */

export function SectionShell({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">{title}</h1>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

export function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-800 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
