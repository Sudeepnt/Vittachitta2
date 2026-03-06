"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

interface ProjectDetailProps {
  project: any;
  onClose: () => void;
}

export default function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#F5F5F5]"
    >
      <header className="fixed top-0 left-0 right-0 z-40 p-6 flex items-center justify-between bg-[#F5F5F5]">
        <motion.h1
          className="text-[#2D2FE8] text-2xl font-bold tracking-wider cursor-pointer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          onClick={onClose}
        >
          361°
        </motion.h1>

        <motion.button
          onClick={onClose}
          className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 relative z-50"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="w-8 h-0.5 bg-[#2D2FE8] transition-all rotate-45 absolute" />
          <span className="w-8 h-0.5 bg-[#2D2FE8] transition-all -rotate-45 absolute" />
        </motion.button>
      </header>

      <div className="h-screen overflow-y-auto pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <p className="text-gray-600 text-xs uppercase tracking-wider mb-4">
              {project.category}
            </p>
            <h1 className="text-[#2D2FE8] text-4xl md:text-6xl font-bold mb-8">
              {project.title}
            </h1>
          </motion.div>

          {project.sections?.map((section: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="mb-16"
            >
              <h2 className="text-[#2D2FE8] text-xl md:text-2xl font-bold mb-6 uppercase tracking-wide">
                {section.heading}
              </h2>
              
              {section.image && (
                <div className="mb-8 rounded-lg overflow-hidden border-2 border-[#2D2FE8]/20">
                  <img 
                    src={section.image} 
                    alt={section.heading}
                    className="w-full h-auto"
                  />
                </div>
              )}

              <div className="space-y-4 text-gray-700 text-base leading-relaxed">
                {section.content?.map((paragraph: string, pIndex: number) => (
                  <p key={pIndex}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="border-t-2 border-gray-300 pt-12 mt-16"
          >
            <h2 className="text-[#2D2FE8] text-2xl md:text-3xl font-bold mb-8">
              Let's talk about your project
            </h2>
            
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gray-300 flex-shrink-0"></div>
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-1">
                  {project.contact?.name || "Mateusz Walaszczyk"}
                </h3>
                <p className="text-[#2D2FE8] text-sm font-medium mb-2">
                  {project.contact?.title || "Client Service Director"}
                </p>
                <p className="text-gray-600 text-sm">
                  {project.contact?.email || "m.walaszczyk@361.sh"}
                </p>
                <p className="text-gray-600 text-sm">
                  {project.contact?.phone || "+48 505 931 537"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="fixed left-6 top-1/2 -translate-y-1/2 hidden md:block">
        <div className="writing-mode-vertical text-[#2D2FE8] text-sm font-bold tracking-widest uppercase">
          <p style={{ writingMode: 'vertical-rl' }}>TECHNOLOGY</p>
        </div>
      </div>

      <div className="fixed left-6 bottom-8 hidden md:flex flex-col gap-4">
        <div className="w-16 h-16 bg-[#2D2FE8] rounded flex items-center justify-center text-white font-bold text-xl">
          {project.tech?.icon1 || "ZF"}
        </div>
        <div className="w-16 h-16 bg-[#2D2FE8] rounded flex items-center justify-center text-white font-bold text-xl">
          {project.tech?.icon2 || "M"}
        </div>
        <div className="w-16 h-16 bg-[#2D2FE8] rounded flex items-center justify-center text-white font-bold">
          iOS
        </div>
      </div>
    </motion.div>
  );
}
