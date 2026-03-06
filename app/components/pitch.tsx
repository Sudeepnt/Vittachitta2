"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Menu from "./menu";

interface PitchProps {
  onNavigate: (view: "home" | "cases" | "services" | "technologies" | "contact") => void;
}

export default function Pitch({ onNavigate }: PitchProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    project: "",
    email: "",
    consent: false,
  });

  useEffect(() => {
    fetch('/data/content.json')
      .then(res => res.json())
      .then(data => {
        if (data?.contact) {
          setContent(data.contact);
        }
      })
      .catch(error => console.error('Failed to load contact:', error));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p>Loading contact...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-40 p-6 flex items-center justify-between bg-[#F5F5F5]">
          <motion.h1
            className="text-[#2D2FE8] text-2xl font-bold tracking-wider cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => onNavigate("home")}
          >
            361°
          </motion.h1>

          <motion.button
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 flex flex-col items-end justify-center gap-1.5 relative z-50"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="w-8 h-0.5 bg-[#2D2FE8] transition-all" />
            <span className="w-6 h-0.5 bg-[#2D2FE8] transition-all" />
            <span className="w-8 h-0.5 bg-[#2D2FE8] transition-all" />
          </motion.button>
        </header>

        <main className="flex-1 pt-28 pb-8 px-6 md:px-12 max-w-4xl mx-auto w-full">
          <motion.form
            onSubmit={handleSubmit}
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="mb-4 text-base md:text-lg text-gray-900">
              <span>Hi, my name is </span>
              <input
                type="text"
                placeholder="your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#E8E9F3] border-0 outline-none px-3 py-1 rounded-md text-[#2D2FE8] placeholder-[#A5A5C0] inline-block w-auto min-w-[100px]"
              />
              <span> and I'm looking for </span>
              <input
                type="text"
                placeholder="project"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="bg-[#E8E9F3] border-0 outline-none px-3 py-1 rounded-md text-[#2D2FE8] placeholder-[#A5A5C0] inline-block w-auto min-w-[90px]"
              />
              <span>.</span>
            </div>

            <div className="mb-8 text-base md:text-lg text-gray-900">
              <span>Get in touch with me at </span>
              <input
                type="email"
                placeholder="your e-mail"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-[#E8E9F3] border-0 outline-none px-3 py-1 rounded-md text-[#2D2FE8] placeholder-[#A5A5C0] inline-block w-auto min-w-[130px]"
              />
              <span>.</span>
            </div>

            <div className="mb-8 max-w-2xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="w-5 h-5 mt-0.5 border-2 border-[#2D2FE8] rounded accent-[#2D2FE8] cursor-pointer flex-shrink-0"
                />
                <span className="text-xs text-gray-500 leading-relaxed">
                  Hereby I authorise 361.SH Sp. z o.o. with its seat in Warsaw, 02-737, ul. Niedzwiedzia 29A, to process the given personal information in connection with my the inquiry. I am aware that submitting personal data is voluntary and that I have a right to view, edit and delete all the data concerning myself.
                </span>
              </label>
            </div>

            <motion.button
              type="submit"
              className="bg-[#2D2FE8] text-white px-8 py-3 rounded-md font-medium flex items-center gap-3 hover:bg-[#1f21b8] transition-colors text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </motion.form>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-300 flex-shrink-0"></div>
              <div>
                <h3 className="text-gray-900 font-medium mb-0.5 text-sm">{content.person.name}</h3>
                <p className="text-[#2D2FE8] text-xs mb-3">{content.person.title}</p>
                <p className="text-gray-600 text-xs mb-0.5">{content.person.email}</p>
                <p className="text-gray-600 text-xs">{content.person.phone}</p>
              </div>
            </div>

            <div className="text-gray-600 text-xs space-y-0.5">
              <p>{content.address.street}</p>
              <p>{content.address.city}</p>
              <p className="pt-3">{content.address.phone}</p>
              <p>{content.address.email}</p>
            </div>

            <div className="bg-[#E8E9F3] p-6 rounded-md">
              <p className="text-[#2D2FE8] text-xs mb-3">{content.careers.text}</p>
              <a
                href={`mailto:${content.careers.email}`}
                className="text-gray-900 text-xl font-bold hover:opacity-70 transition-opacity break-all"
              >
                {content.careers.email}
              </a>
            </div>
          </motion.div>
        </main>
      </div>

      <Menu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNavigate={onNavigate}
        currentView="contact"
      />
    </>
  );
}
