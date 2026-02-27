"use client";

import React, { useEffect, useState, useRef, FormEvent } from "react";
import { toast } from "react-toastify";
import { motion } from "motion/react";
import Modal from "./Modal";
import { requestHandler } from "@/app/src/utils";
import {
  getProfile,
  createProfile,
  updateProfile,
} from "@/helpers/api";

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

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [typewriterStrings, setTypewriterStrings] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);
  const heroImageRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    await requestHandler(
      getProfile,
      setLoading,
      (res) => {
        setProfile(res.data);
      },
      () => {
        // Profile not found is fine — user hasn't created one yet
        setProfile(null);
      }
    );
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openCreate = () => {
    setIsEdit(false);
    setName(""); setRole(""); setBio(""); setEmail(""); setPhone(""); setAddress("");
    setTypewriterStrings(""); setPhotoFile(null); setResumeFile(null); setHeroImageFile(null);
    setPhotoPreview(null); setHeroImagePreview(null);
    setGithub(""); setLinkedin(""); setTwitter(""); setInstagram(""); setYoutube("");
    if (photoRef.current) photoRef.current.value = "";
    if (resumeRef.current) resumeRef.current.value = "";
    if (heroImageRef.current) heroImageRef.current.value = "";
    setModalOpen(true);
  };

  const openEdit = () => {
    if (!profile) return;
    setIsEdit(true);
    setName(profile.name);
    setRole(profile.role || "");
    setBio(profile.bio);
    setEmail(profile.email || "");
    setPhone(profile.phone || "");
    setAddress(profile.address || "");
    setTypewriterStrings(profile.typewriterStrings?.join("\n") || "");
    setPhotoFile(null);
    setResumeFile(null);
    setHeroImageFile(null);
    setPhotoPreview(profile.photo || null);
    setHeroImagePreview(profile.heroImage || null);
    setGithub(profile.socialLinks?.github || "");
    setLinkedin(profile.socialLinks?.linkedin || "");
    setTwitter(profile.socialLinks?.twitter || "");
    setInstagram(profile.socialLinks?.instagram || "");
    setYoutube(profile.socialLinks?.youtube || "");
    if (photoRef.current) photoRef.current.value = "";
    if (resumeRef.current) resumeRef.current.value = "";
    if (heroImageRef.current) heroImageRef.current.value = "";
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const twStrings = typewriterStrings.split("\n").map((s) => s.trim()).filter(Boolean);
    if (twStrings.length === 0) {
      toast.error("Add at least one typewriter string");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("role", role);
    fd.append("bio", bio);
    fd.append("email", email);
    if (phone) fd.append("phone", phone);
    if (address) fd.append("address", address);
    fd.append("typewriterStrings", JSON.stringify(twStrings));
    if (photoFile) fd.append("photo", photoFile);
    if (resumeFile) fd.append("resume", resumeFile);
    if (heroImageFile) fd.append("heroImage", heroImageFile);

    const socialLinks: SocialLinks = {};
    if (github) socialLinks.github = github;
    if (linkedin) socialLinks.linkedin = linkedin;
    if (twitter) socialLinks.twitter = twitter;
    if (instagram) socialLinks.instagram = instagram;
    if (youtube) socialLinks.youtube = youtube;
    if (Object.keys(socialLinks).length > 0) {
      fd.append("socialLinks", JSON.stringify(socialLinks));
    }

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
            <motion.button
              onClick={openEdit}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 self-start"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Edit Profile
            </motion.button>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Your full name"
              required
            />
          </Field>
          <Field label="Role" required>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
              placeholder="e.g. Full Stack Developer"
              required
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
            />
          </Field>
          <Field label="Bio" required>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field min-h-24 resize-y"
              placeholder="A short bio about yourself"
              required
            />
          </Field>
          <Field label="Typewriter Strings (one per line)" required>
            <textarea
              value={typewriterStrings}
              onChange={(e) => setTypewriterStrings(e.target.value)}
              className="input-field min-h-20 resize-y"
              placeholder={"Full Stack Developer\nUI/UX Designer\nOpen Source Contributor"}
              required
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone">
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+1 234 567 890" />
            </Field>
            <Field label="Address">
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" placeholder="City, Country" />
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
                <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} className="input-field" placeholder="https://github.com/username" />
              </Field>
              <Field label="LinkedIn">
                <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="input-field" placeholder="https://linkedin.com/in/username" />
              </Field>
              <Field label="Twitter">
                <input type="url" value={twitter} onChange={(e) => setTwitter(e.target.value)} className="input-field" placeholder="https://twitter.com/username" />
              </Field>
              <Field label="Instagram">
                <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="input-field" placeholder="https://instagram.com/username" />
              </Field>
              <Field label="YouTube">
                <input type="url" value={youtube} onChange={(e) => setYoutube(e.target.value)} className="input-field" placeholder="https://youtube.com/@channel" />
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
