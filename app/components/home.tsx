"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Menu from "./menu";

interface HomeProps {
  onNavigate: (view: "home" | "cases" | "services" | "technologies" | "contact") => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetch('/data/content.json')
      .then(res => res.json())
      .then(data => {
        if (data?.home) {
          setContent(data.home);
        }
      })
      .catch(error => console.error('Failed to load home content:', error));
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col relative overflow-hidden">
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

        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h2 className="text-[#2D2FE8] text-4xl md:text-7xl font-bold mb-3">
              {content.title}
            </h2>
            <p className="text-[#2D2FE8] text-lg md:text-2xl font-medium">
              {content.subtitle}
            </p>
          </motion.div>
        </main>

     <footer className="absolute bottom-20 md:bottom-12 left-0 right-0">
  <motion.div
    className="text-center px-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8 }}
  >
    <p className="text-gray-900 text-base md:text-lg font-bold mb-4">
      Let's talk about your project
    </p>
    
    <div className="flex justify-center">
      <motion.button
        onClick={() => onNavigate("contact")}
        className="relative w-8 h-8 flex items-center justify-center cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          className="absolute w-8 h-8 rounded-full border-2 border-[#2D2FE8]"
          animate={{
            scale: [1, 1.8],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        <div className="w-2 h-2 rounded-full bg-[#2D2FE8]" />
      </motion.button>
    </div>
  </motion.div>
</footer>

      </div>

      <Menu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNavigate={onNavigate}
        currentView="home"
      />
    </>
  );
}
