"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Menu from "./menu";

interface TechnologiesProps {
  onNavigate: (view: "home" | "cases" | "services" | "technologies" | "contact") => void;
}

export default function Technologies({ onNavigate }: TechnologiesProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetch('/data/content.json')
      .then(res => res.json())
      .then(data => {
        if (data?.technologies) {
          setContent(data.technologies);
        }
      })
      .catch(error => console.error('Failed to load technologies:', error));
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p>Loading technologies...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F5F5F5]">
        <header className="fixed top-0 left-0 right-0 z-40 p-6 flex items-center justify-between bg-[#F5F5F5]">
          <motion.h1
            className="text-[#121bde] font-bold tracking-wider cursor-pointer"
            style={{ fontSize: 'clamp(20px, 2vw, 32px)' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => onNavigate("home")}
          >
            361°
          </motion.h1>

          <motion.button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-end justify-center gap-1.5 relative z-50"
            style={{ width: 'clamp(32px, 3vw, 48px)', height: 'clamp(32px, 3vw, 48px)' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="bg-[#121bde] transition-all" style={{ width: 'clamp(24px, 2.5vw, 40px)', height: '2px' }} />
            <span className="bg-[#121bde] transition-all" style={{ width: 'clamp(20px, 2vw, 32px)', height: '2px' }} />
            <span className="bg-[#121bde] transition-all" style={{ width: 'clamp(24px, 2.5vw, 40px)', height: '2px' }} />
          </motion.button>
        </header>

        <main className="min-h-screen flex items-center justify-center" style={{ padding: 'clamp(24px, 5vw, 80px)' }}>
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-center" style={{ gap: 'clamp(48px, 8vw, 160px)', maxWidth: '1600px' }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-[#121bde] font-bold" style={{ fontSize: 'clamp(28px, 4vw, 72px)', marginBottom: 'clamp(16px, 2vw, 32px)' }}>
                {content.title}
              </h1>
              <p className="text-gray-600" style={{ fontSize: 'clamp(14px, 1.2vw, 20px)', lineHeight: '1.6' }}>
                {content.description}
              </p>
            </motion.div>

            <div className="grid grid-cols-3 justify-items-center" style={{ gap: 'clamp(24px, 3vw, 64px)' }}>
              {content.items.map((tech: any, index: number) => (
                <motion.div
                  key={tech.name}
                  className="flex flex-col items-center"
                  style={{ gap: 'clamp(8px, 1vw, 16px)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05, duration: 0.4 }}
                >
                  <div 
                    className="bg-[#0600ff] flex items-center justify-center"
                    style={{ 
                      width: 'clamp(48px, 5vw, 96px)', 
                      height: 'clamp(48px, 5vw, 96px)' 
                    }}
                  >
                    <span className="text-white font-bold" style={{ fontSize: 'clamp(12px, 1.2vw, 20px)' }}>
                      {tech.icon}
                    </span>
                  </div>
                  <span className="text-[#121bde] font-medium text-center" style={{ fontSize: 'clamp(10px, 1vw, 16px)' }}>
                    {tech.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Menu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNavigate={onNavigate}
        currentView="technologies"
      />
    </>
  );
}
