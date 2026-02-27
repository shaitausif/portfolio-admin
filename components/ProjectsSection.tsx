"use client";

import React, { useEffect, useState, useRef, FormEvent } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";
import Modal from "./Modal";
import { SectionShell, Field } from "./ProfileSection";
import { requestHandler } from "@/app/src/utils";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/helpers/api";

interface ProjectData {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  liveLink: string;
  githubLink?: string;
  featured: boolean;
  order?: number;
  screenshots?: string[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, type: "spring" as const, stiffness: 260, damping: 22 },
  }),
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.2 } },
};

export default function ProjectsSection() {
  const [items, setItems] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProjectData | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [technologies, setTechnologies] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState("");
  const [screenshotFiles, setScreenshotFiles] = useState<FileList | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const screenshotsRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    await requestHandler(
      getProjects,
      setLoading,
      (res) => setItems(res.data || []),
      () => setItems([])
    );
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setTitle(""); setDescription(""); setImageFile(null);
    setImagePreview(null); setTechnologies(""); setLiveLink("");
    setGithubLink(""); setFeatured(false); setOrder("");
    setScreenshotFiles(null);
    if (imageRef.current) imageRef.current.value = "";
    if (screenshotsRef.current) screenshotsRef.current.value = "";
  };

  const openCreate = () => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item: ProjectData) => {
    setEditItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setImageFile(null);
    setImagePreview(item.imageUrl || null);
    setTechnologies(item.technologies.join(", "));
    setLiveLink(item.liveLink);
    setGithubLink(item.githubLink || "");
    setFeatured(item.featured || false);
    setOrder(item.order != null ? String(item.order) : "");
    setScreenshotFiles(null);
    if (imageRef.current) imageRef.current.value = "";
    if (screenshotsRef.current) screenshotsRef.current.value = "";
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await requestHandler(
      () => deleteProject(id),
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
    const techArray = technologies.split(",").map((t) => t.trim()).filter(Boolean);

    if (techArray.length === 0) {
      toast.error("Add at least one technology");
      return;
    }

    if (!editItem && !imageFile) {
      toast.error("Project image is required");
      return;
    }

    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("technologies", JSON.stringify(techArray));
    fd.append("liveLink", liveLink);
    if (githubLink) fd.append("githubLink", githubLink);
    fd.append("featured", String(featured));
    if (order) fd.append("order", order);
    if (imageFile) fd.append("image", imageFile);
    if (screenshotFiles) {
      Array.from(screenshotFiles).forEach((file) => fd.append("screenshots", file));
    }
    if (editItem) fd.append("_id", editItem._id);

    const apiCall = editItem
      ? () => updateProject(fd)
      : () => createProject(fd);

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

  if (loading) {
    return <SectionShell title="Projects"><p className="text-zinc-500">Loading...</p></SectionShell>;
  }

  return (
    <SectionShell
      title="Projects"
      action={
        <motion.button
          onClick={openCreate}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          whileHover={{ scale: 1.04, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
          whileTap={{ scale: 0.96 }}
        >
          + Add Project
        </motion.button>
      }
    >
      {items.length === 0 ? (
        <motion.p
          className="text-center text-zinc-500 py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No projects added yet.
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.div
                key={item._id}
                className="rounded-lg border border-zinc-200 bg-white overflow-hidden"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={i}
                layout
                whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {item.imageUrl && (
                  <motion.div
                    className="h-40 bg-zinc-100 flex items-center justify-center overflow-hidden relative"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    {item.featured && (
                      <span className="absolute top-2 right-2 rounded-full bg-yellow-400 text-yellow-900 px-2.5 py-0.5 text-xs font-bold shadow">Featured</span>
                    )}
                  </motion.div>
                )}
                <div className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-zinc-900">{item.title}</h3>
                    <div className="flex gap-2 shrink-0">
                      <motion.button onClick={() => openEdit(item)} className="text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer" whileTap={{ scale: 0.92 }}>Edit</motion.button>
                      <motion.button onClick={() => handleDelete(item._id)} className="text-sm text-red-600 hover:text-red-800 cursor-pointer" whileTap={{ scale: 0.92 }}>Delete</motion.button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{item.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.technologies.map((tech, idx) => (
                      <motion.span
                        key={idx}
                        className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 + idx * 0.04 + 0.2, type: "spring", stiffness: 500, damping: 20 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                  <a href={item.liveLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                    Live Demo →
                  </a>
                  {item.githubLink && (
                    <a href={item.githubLink} target="_blank" rel="noopener noreferrer" className="mt-3 ml-4 inline-block text-sm text-zinc-600 hover:underline">
                      GitHub →
                    </a>
                  )}
                  {item.screenshots && item.screenshots.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {item.screenshots.map((ss, idx) => (
                        <img key={idx} src={ss} alt={`Screenshot ${idx + 1}`} className="h-16 rounded border border-zinc-200 object-cover shrink-0" />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Project" : "Add Project"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" required>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
          </Field>
          <Field label="Description" required>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field min-h-20 resize-y" required />
          </Field>
          <Field label="Image" required={!editItem}>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-32 object-cover rounded-md border border-zinc-200 mb-2"
              />
            )}
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
                if (file) setImagePreview(URL.createObjectURL(file));
              }}
              className="input-field file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 file:cursor-pointer"
              required={!editItem}
            />
          </Field>
          <Field label="Technologies" required>
            <input type="text" value={technologies} onChange={(e) => setTechnologies(e.target.value)} className="input-field" placeholder="React, Node.js, MongoDB (comma separated)" required />
          </Field>
          <Field label="Live Link" required>
            <input type="url" value={liveLink} onChange={(e) => setLiveLink(e.target.value)} className="input-field" placeholder="https://..." required />
          </Field>
          <Field label="GitHub Link">
            <input type="url" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} className="input-field" placeholder="https://github.com/..." />
          </Field>
          <Field label="Screenshots">
            {editItem?.screenshots && editItem.screenshots.length > 0 && (
              <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                {editItem.screenshots.map((ss, idx) => (
                  <img key={idx} src={ss} alt={`Screenshot ${idx + 1}`} className="h-14 rounded border border-zinc-200 object-cover shrink-0" />
                ))}
              </div>
            )}
            <input
              ref={screenshotsRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setScreenshotFiles(e.target.files)}
              className="input-field file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 file:cursor-pointer"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-zinc-800 w-4 h-4 cursor-pointer" />
              <label htmlFor="featured" className="text-sm text-zinc-700 cursor-pointer">Featured Project</label>
            </div>
            <Field label="Display Order">
              <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="input-field" placeholder="e.g. 1, 2, 3" />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <motion.button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Cancel</motion.button>
            <motion.button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 cursor-pointer" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>{editItem ? "Update" : "Create"}</motion.button>
          </div>
        </form>
      </Modal>
    </SectionShell>
  );
}
