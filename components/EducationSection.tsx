"use client";

import React, { useEffect, useState, useRef, FormEvent } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";
import Modal from "./Modal";
import { SectionShell, Field } from "./ProfileSection";
import { requestHandler } from "@/app/src/utils";
import {
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
} from "@/helpers/api";

interface EducationData {
  _id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
  institutionLogo?: string;
  grade?: string;
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

export default function EducationSection() {
  const [items, setItems] = useState<EducationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<EducationData | null>(null);

  // Form state
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [grade, setGrade] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    await requestHandler(
      getEducation,
      setLoading,
      (res) => setItems(res.data || []),
      () => setItems([])
    );
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setInstitution(""); setDegree(""); setFieldOfStudy("");
    setStartDate(""); setEndDate(""); setDescription("");
    setLogoFile(null); setLogoPreview(null); setGrade("");
    if (logoRef.current) logoRef.current.value = "";
  };

  const openCreate = () => {
    setEditItem(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item: EducationData) => {
    setEditItem(item);
    setInstitution(item.institution);
    setDegree(item.degree);
    setFieldOfStudy(item.fieldOfStudy);
    setStartDate(item.startDate?.slice(0, 10) || "");
    setEndDate(item.endDate?.slice(0, 10) || "");
    setDescription(item.description || "");
    setLogoFile(null);
    setLogoPreview(item.institutionLogo || null);
    setGrade(item.grade || "");
    if (logoRef.current) logoRef.current.value = "";
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this education entry?")) return;
    await requestHandler(
      () => deleteEducation(id),
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
    const fd = new FormData();
    fd.append("institution", institution);
    fd.append("degree", degree);
    fd.append("fieldOfStudy", fieldOfStudy);
    fd.append("startDate", startDate);
    if (endDate) fd.append("endDate", endDate);
    if (description) fd.append("description", description);
    if (grade) fd.append("grade", grade);
    if (logoFile) fd.append("institutionLogo", logoFile);
    if (editItem) fd.append("_id", editItem._id);

    const apiCall = editItem
      ? () => updateEducation(fd)
      : () => createEducation(fd);

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
    return <SectionShell title="Education"><p className="text-zinc-500">Loading...</p></SectionShell>;
  }

  return (
    <SectionShell
      title="Education"
      action={
        <motion.button
          onClick={openCreate}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          whileHover={{ scale: 1.04, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
          whileTap={{ scale: 0.96 }}
        >
          + Add Education
        </motion.button>
      }
    >
      {items.length === 0 ? (
        <motion.p
          className="text-center text-zinc-500 py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No education entries yet.
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
                    {item.institutionLogo && (
                      <img src={item.institutionLogo} alt={item.institution} className="w-10 h-10 rounded-md object-contain border border-zinc-100 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-zinc-900">{item.degree}</h3>
                      <p className="text-sm text-zinc-600">{item.institution} — {item.fieldOfStudy}</p>
                      <p className="text-xs text-zinc-500 mt-1">{formatDate(item.startDate)} – {formatDate(item.endDate)}</p>
                      {item.grade && (
                        <p className="text-xs text-zinc-600 mt-1">Grade: <span className="font-medium">{item.grade}</span></p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <motion.button onClick={() => openEdit(item)} className="text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer" whileTap={{ scale: 0.92 }}>Edit</motion.button>
                    <motion.button onClick={() => handleDelete(item._id)} className="text-sm text-red-600 hover:text-red-800 cursor-pointer" whileTap={{ scale: 0.92 }}>Delete</motion.button>
                  </div>
                </div>
                {item.description && (
                  <p className="mt-3 text-sm text-zinc-700 whitespace-pre-line">{item.description}</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Education" : "Add Education"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Institution" required>
            <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} className="input-field" required />
          </Field>
          <Field label="Institution Logo">
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
            />
          </Field>
          <Field label="Degree" required>
            <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} className="input-field" required />
          </Field>
          <Field label="Field of Study" required>
            <input type="text" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} className="input-field" required />
          </Field>
          <Field label="Grade">
            <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} className="input-field" placeholder="e.g. 3.8 GPA, First Class Honours" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start Date" required>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" required />
            </Field>
            <Field label="End Date">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
            </Field>
          </div>
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field min-h-20 resize-y" />
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
