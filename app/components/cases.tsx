"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Menu from "./menu";
import ProjectDetail from "./projectDetail";

interface CasesProps {
  onNavigate: (view: "home" | "cases" | "services" | "technologies" | "contact") => void;
}

export default function Cases({ onNavigate }: CasesProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectsData, setProjectsData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/content.json')
      .then(res => res.json())
      .then(data => {
        if (data?.cases?.projects) {
          setProjectsData(data.cases.projects);
        }
      })
      .catch(error => console.error('Failed to load cases:', error));
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
        <header className="fixed top-0 left-0 right-0 z-40 p-6 flex items-center justify-between bg-[#F5F5F5]">
          <motion.h1
            className="text-[#121bde] text-2xl font-bold tracking-wider cursor-pointer"
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
            <span className="w-8 h-0.5 bg-[#121bde] transition-all" />
            <span className="w-6 h-0.5 bg-[#121bde] transition-all" />
            <span className="w-8 h-0.5 bg-[#121bde] transition-all" />
          </motion.button>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="max-w-2xl w-full space-y-16">
            {projectsData.map((project, index) => (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
              >
                <button
                  onClick={() => setSelectedProject(project)}
                  className="block group w-full text-left"
                >
                  <p className="text-black text-xs uppercase tracking-wider mb-3 opacity-60">
                    {project.category}
                  </p>
                  <h2 className="text-[#121bde] text-3xl md:text-4xl font-bold group-hover:opacity-70 transition-opacity">
                    {project.title}
                  </h2>
                </button>

                {index < projectsData.length - 1 && (
                  <div className="mt-12 h-px bg-gray-300" />
                )}
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      <Menu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNavigate={onNavigate}
        currentView="cases"
      />
      
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}
