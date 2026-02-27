"use client";

import React, { useEffect, useState, useRef, FormEvent } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";
import Modal from "./Modal";
import { SectionShell, Field } from "./ProfileSection";
import { requestHandler } from "@/app/src/utils";
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "@/helpers/api";

interface SkillData {
  _id: string;
  name: string;
  level: number;
  logo: string;
  category?: string;
  description?: string;
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.06, type: "spring" as const, stiffness: 300, damping: 22 },
  }),
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.18 } },
};

export default function SkillsSection() {
  const [items, setItems] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SkillData | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [level, setLevel] = useState(50);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    await requestHandler(
      getSkills,
      setLoading,
      (res) => setItems(res.data || []),
      () => setItems([])
    );
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setName(""); setLevel(50); setLogoFile(null); setLogoPreview(null);
    setCategory(""); setDescription("");
    if (logoRef.current) logoRef.current.value = "";
  };

  const openCreate = () => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item: SkillData) => {
    setEditItem(item);
    setName(item.name);
    setLevel(item.level);
    setLogoFile(null);
    setLogoPreview(item.logo || null);
    setCategory(item.category || "");
    setDescription(item.description || "");
    if (logoRef.current) logoRef.current.value = "";
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    await requestHandler(
      () => deleteSkill(id),
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

    if (!editItem && !logoFile) {
      toast.error("Skill logo is required");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("level", String(level));
    if (category) fd.append("category", category);
    if (description) fd.append("description", description);
    if (logoFile) fd.append("logo", logoFile);
    if (editItem) fd.append("_id", editItem._id);

    const apiCall = editItem
      ? () => updateSkill(fd)
      : () => createSkill(fd);

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

  const levelColor = (lvl: number) => {
    if (lvl >= 80) return "bg-green-100 text-green-800";
    if (lvl >= 60) return "bg-blue-100 text-blue-800";
    if (lvl >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-zinc-100 text-zinc-800";
  };

  if (loading) {
    return <SectionShell title="Skills"><p className="text-zinc-500">Loading...</p></SectionShell>;
  }

  return (
    <SectionShell
      title="Skills"
      action={
        <motion.button
          onClick={openCreate}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          whileHover={{ scale: 1.04, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
          whileTap={{ scale: 0.96 }}
        >
          + Add Skill
        </motion.button>
      }
    >
      {items.length === 0 ? (
        <motion.p
          className="text-center text-zinc-500 py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No skills added yet.
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.div
                key={item._id}
                className="rounded-lg border border-zinc-200 bg-white p-4"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={i}
                layout
                whileHover={{ y: -4, boxShadow: "0 10px 28px rgba(0,0,0,0.10)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {item.logo && (
                      <img src={item.logo} alt={item.name} className="w-10 h-10 rounded-md object-contain border border-zinc-100" />
                    )}
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900">{item.name}</h3>
                      {item.category && (
                        <span className="text-xs text-zinc-500">{item.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button onClick={() => openEdit(item)} className="text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer" whileTap={{ scale: 0.92 }}>Edit</motion.button>
                    <motion.button onClick={() => handleDelete(item._id)} className="text-sm text-red-600 hover:text-red-800 cursor-pointer" whileTap={{ scale: 0.92 }}>Delete</motion.button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <motion.span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${levelColor(item.level)}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20, delay: i * 0.06 + 0.15 }}
                    >
                      {item.level}%
                    </motion.span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-2">
                    <motion.div
                      className="bg-zinc-800 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.level}%` }}
                      transition={{ duration: 0.8, delay: i * 0.06 + 0.2, ease: "easeOut" }}
                    />
                  </div>
                </div>
                {item.description && (
                  <p className="mt-2 text-sm text-zinc-600">{item.description}</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Skill" : "Add Skill"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name" required>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g. React, Node.js" required />
          </Field>
          <Field label="Logo" required={!editItem}>
            {logoPreview && (
              <img src={logoPreview} alt="Logo preview" className="w-12 h-12 rounded-md object-contain border border-zinc-200 mb-2" />
            )}
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setLogoFile(file);
                if (file) setLogoPreview(URL.createObjectURL(file));
              }}
              className="input-field file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 file:cursor-pointer"
              required={!editItem}
            />
          </Field>
          <Field label={`Level (${level}%)`} required>
            <input type="range" min={0} max={100} value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full accent-zinc-800" />
            <div className="flex justify-between text-xs text-zinc-400 mt-1"><span>0%</span><span>50%</span><span>100%</span></div>
          </Field>
          <Field label="Category">
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="input-field" placeholder="e.g. Frontend, Backend, DevOps" />
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field min-h-14 resize-y" placeholder="Optional description" />
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
