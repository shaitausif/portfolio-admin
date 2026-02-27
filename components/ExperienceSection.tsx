"use client";

import React, { useEffect, useState, useRef, FormEvent } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";
import Modal from "./Modal";
import { SectionShell, Field } from "./ProfileSection";
import { requestHandler } from "@/app/src/utils";
import {
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from "@/helpers/api";

interface ExperienceData {
  _id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string[];
  media?: string;
  companyLogo?: string;
  technologies?: string[];
  isCurrentRole: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, type: "spring" as const, stiffness: 280, damping: 24 },
  }),
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
};

export default function ExperienceSection() {
  const [items, setItems] = useState<ExperienceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExperienceData | null>(null);

  // Form state
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);
  const [technologies, setTechnologies] = useState("");
  const [isCurrentRole, setIsCurrentRole] = useState(false);
  const mediaRef = useRef<HTMLInputElement>(null);
  const companyLogoRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    await requestHandler(
      getExperience,
      setLoading,
      (res) => setItems(res.data || []),
      () => setItems([])
    );
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setJobTitle(""); setCompany(""); setLocation("");
    setStartDate(""); setEndDate(""); setDescription("");
    setMediaFile(null); setCompanyLogoFile(null); setCompanyLogoPreview(null);
    setTechnologies(""); setIsCurrentRole(false);
    if (mediaRef.current) mediaRef.current.value = "";
    if (companyLogoRef.current) companyLogoRef.current.value = "";
  };

  const openCreate = () => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item: ExperienceData) => {
    setEditItem(item);
    setJobTitle(item.jobTitle);
    setCompany(item.company);
    setLocation(item.location);
    setStartDate(item.startDate?.slice(0, 10) || "");
    setEndDate(item.endDate?.slice(0, 10) || "");
    setDescription(Array.isArray(item.description) ? item.description.join("\n") : item.description || "");
    setCompanyLogoFile(null);
    setCompanyLogoPreview(item.companyLogo || null);
    setTechnologies(item.technologies?.join(", ") || "");
    setIsCurrentRole(item.isCurrentRole || false);
    setMediaFile(null);
    if (mediaRef.current) mediaRef.current.value = "";
    if (companyLogoRef.current) companyLogoRef.current.value = "";
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this experience?")) return;
    await requestHandler(
      () => deleteExperience(id),
      null,
      (res) => {
        toast.success(res.message);
        setItems((prev) => prev.filter((i) => i._id !== id));
      },
      (err) => toast.error(err)
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const bullets = description.split("\n").map((s) => s.trim()).filter(Boolean);
    if (bullets.length === 0) {
      toast.error("Add at least one description bullet point");
      return;
    }

    const fd = new FormData();
    fd.append("jobTitle", jobTitle);
    fd.append("company", company);
    fd.append("location", location);
    fd.append("startDate", startDate);
    if (endDate) fd.append("endDate", endDate);
    fd.append("description", JSON.stringify(bullets));
    fd.append("isCurrentRole", String(isCurrentRole));
    if (mediaFile) fd.append("media", mediaFile);
    if (companyLogoFile) fd.append("companyLogo", companyLogoFile);
    if (editItem) fd.append("_id", editItem._id);

    const techArray = technologies.split(",").map((t) => t.trim()).filter(Boolean);
    if (techArray.length > 0) fd.append("technologies", JSON.stringify(techArray));

    const apiCall = editItem
      ? () => updateExperience(fd)
      : () => createExperience(fd);

    await requestHandler(
      apiCall,
      null,
      (res) => {
        toast.success(res.message);
        if (editItem) {
          setItems((prev) => prev.map((i) => (i._id === editItem._id ? res.data : i)));
        } else {
          setItems((prev) => [...prev, res.data]);
        }
        setModalOpen(false);
      },
      (err) => toast.error(err)
    );
  };

  const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "Present");

  if (loading) {
    return <SectionShell title="Experience"><p className="text-zinc-500">Loading...</p></SectionShell>;
  }

  return (
    <SectionShell
      title="Experience"
      action={
        <motion.button
          onClick={openCreate}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          whileHover={{ scale: 1.04, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
          whileTap={{ scale: 0.96 }}
        >
          + Add Experience
        </motion.button>
      }
    >
      {items.length === 0 ? (
        <motion.p
          className="text-center text-zinc-500 py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No experience entries yet.
        </motion.p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.div
                key={item._id}
                className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={i}
                layout
                whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    {item.companyLogo && (
                      <img src={item.companyLogo} alt={item.company} className="w-10 h-10 rounded-md object-contain border border-zinc-100 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-zinc-900">{item.jobTitle}</h3>
                        {item.isCurrentRole && (
                          <span className="rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium">Current</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-600">{item.company} — {item.location}</p>
                      <p className="text-xs text-zinc-500 mt-1">{formatDate(item.startDate)} – {formatDate(item.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <motion.button onClick={() => openEdit(item)} className="text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer" whileTap={{ scale: 0.92 }}>Edit</motion.button>
                    <motion.button onClick={() => handleDelete(item._id)} className="text-sm text-red-600 hover:text-red-800 cursor-pointer" whileTap={{ scale: 0.92 }}>Delete</motion.button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-zinc-700 whitespace-pre-line">{Array.isArray(item.description) ? item.description.join("\n") : item.description}</p>
                {item.technologies && item.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.technologies.map((tech, idx) => (
                      <span key={idx} className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">{tech}</span>
                    ))}
                  </div>
                )}
                {item.media && (
                  <a
                    href={item.media}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-blue-600 hover:underline"
                  >
                    View Media
                  </a>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Experience" : "Add Experience"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Job Title" required>
            <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="input-field" required />
          </Field>
          <Field label="Company" required>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="input-field" required />
          </Field>
          <Field label="Company Logo">
            {companyLogoPreview && (
              <img src={companyLogoPreview} alt="Company logo" className="w-12 h-12 rounded-md object-contain border border-zinc-200 mb-2" />
            )}
            <input
              ref={companyLogoRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setCompanyLogoFile(file);
                if (file) setCompanyLogoPreview(URL.createObjectURL(file));
              }}
              className="input-field file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 file:cursor-pointer"
            />
          </Field>
          <Field label="Location" required>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" required />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start Date" required>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" required />
            </Field>
            <Field label="End Date">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" disabled={isCurrentRole} />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isCurrentRole" checked={isCurrentRole} onChange={(e) => { setIsCurrentRole(e.target.checked); if (e.target.checked) setEndDate(""); }} className="accent-zinc-800 w-4 h-4 cursor-pointer" />
            <label htmlFor="isCurrentRole" className="text-sm text-zinc-700 cursor-pointer">I currently work here</label>
          </div>
          <Field label="Description (one bullet per line)" required>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field min-h-24 resize-y" placeholder={"Developed REST APIs\nLed a team of 5 engineers\nImproved performance by 40%"} required />
          </Field>
          <Field label="Technologies">
            <input type="text" value={technologies} onChange={(e) => setTechnologies(e.target.value)} className="input-field" placeholder="React, Node.js, MongoDB (comma separated)" />
          </Field>
          <Field label="Media">
            {editItem?.media && (
              <a
                href={editItem.media}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline mb-1 inline-block"
              >
                Current media file
              </a>
            )}
            <input
              ref={mediaRef}
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
              className="input-field file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 file:cursor-pointer"
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <motion.button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Cancel</motion.button>
            <motion.button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 cursor-pointer" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>{editItem ? "Update" : "Create"}</motion.button>
          </div>
        </form>
      </Modal>
    </SectionShell>
  );
}
