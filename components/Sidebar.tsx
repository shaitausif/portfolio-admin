"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarItem {
  key: string;
  label: string;
  icon: string;
}

const items: SidebarItem[] = [
  { key: "profile", label: "Profile", icon: "👤" },
  { key: "experience", label: "Experience", icon: "💼" },
  { key: "education", label: "Education", icon: "🎓" },
  { key: "skills", label: "Skills", icon: "⚡" },
  { key: "projects", label: "Projects", icon: "📁" },
];

const navItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, type: "spring" as const, stiffness: 300, damping: 24 },
  }),
};

interface SidebarProps {
  activeSection: string;
  onSelect: (key: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeSection, onSelect, onLogout, isOpen, onClose }: SidebarProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleItemClick = (key: string) => {
    onSelect(key);
    onClose(); // auto-close on mobile after selecting
  };

  const sidebarContent = (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-200 bg-white">
      {/* Logo / Title */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Portfolio Admin</h1>
          <p className="mt-0.5 text-xs text-zinc-500">Manage your portfolio data</p>
        </div>
        {/* Close button — visible only on mobile */}
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-700 text-xl leading-none cursor-pointer md:hidden"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((item, i) => (
            <motion.li
              key={item.key}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <motion.button
                onClick={() => handleItemClick(item.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  activeSection === item.key
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-zinc-200 px-3 py-4">
        <motion.button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="text-base">🚪</span>
          Logout
        </motion.button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <div className="hidden md:block shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile: overlay sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={overlayRef}
            onClick={(e) => {
              if (e.target === overlayRef.current) onClose();
            }}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute left-0 top-0 h-full"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
            >
              {sidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
