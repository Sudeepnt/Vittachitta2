"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Menu from "./menu";

interface ServicesProps {
  onNavigate: (view: "home" | "cases" | "services" | "technologies" | "contact") => void;
}

export default function Services({ onNavigate }: ServicesProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadServices = () => {
      fetch('/data/content.json')
        .then(res => res.json())
        .then(data => {
          if (data?.services?.items) {
            setServices(data.services.items);
          }
        })
        .catch(error => console.error('Failed to load services:', error));
    };

    loadServices();
    
    const interval = setInterval(loadServices, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % services.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    
    if (info.offset.x > swipeThreshold) {
      handlePrev();
    } else if (info.offset.x < -swipeThreshold) {
      handleNext();
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  if (services.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F5F5F5] relative overflow-hidden">
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

        <main className="flex flex-col items-center justify-center min-h-screen px-6 relative">
    

          <div className="w-full max-w-2xl relative">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="text-center cursor-grab active:cursor-grabbing"
              >
                <div className="mb-8 flex flex-col items-center gap-6">
                  <div className="flex gap-2 items-center">
                    <span className="text-[#2D2FE8] text-sm">+</span>
                    <span className="w-8 h-px bg-[#2D2FE8]/20"></span>
                    <span className="w-3 h-3 border-2 border-[#2D2FE8]/20 rounded-full"></span>
                    <span className="w-8 h-px bg-[#2D2FE8]/20"></span>
                  </div>
                </div>

                <h2 className="text-[#2D2FE8] text-5xl md:text-7xl font-bold mb-6">
                  {services[currentIndex].title.toLowerCase()}.
                </h2>

                <p className="text-gray-600 text-base md:text-lg mb-12 max-w-md mx-auto">
                  {services[currentIndex].description}
                </p>

                <button 
                  onClick={() => setShowModal(true)}
                  className="text-black text-lg font-medium hover:text-[#2D2FE8] transition-colors"
                >
                  see more
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute bottom-24 flex gap-2">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-[#2D2FE8] w-8" : "bg-[#2D2FE8]/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <motion.div
            className="absolute bottom-8"
            animate={{
              x: [-5, 5, -5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#2D2FE8" 
              strokeWidth="1.5"
              className="opacity-60"
            >
              <path d="M9 11l-6 6v-6h6zM9 11V7a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-4" />
              <path d="M9 11l3-3m-3 3l3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#2D2FE8] z-50 flex items-center justify-center p-6"
            onClick={() => setShowModal(false)}
          >
            <motion.button
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 w-10 h-10 text-white hover:opacity-70 transition-opacity"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.3 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </motion.button>

            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl w-full text-white"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                 >
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                {services[currentIndex].title.toLowerCase()}.
              </h2>

              <p className="text-base md:text-lg mb-8 leading-relaxed opacity-90 max-w-xl">
                {services[currentIndex].description}
              </p>

              <p className="text-sm md:text-base mb-12 leading-relaxed opacity-80 max-w-2xl">
                Nowadays, it is mobile devices that are at the leading edge of technology. Therefore, we design our websites with the Mobile First approach in mind and adapt them to their users accordingly, at the same time implementing the business goals assumed at the very outset.
              </p>

              <button 
                onClick={() => {
                  setShowModal(false);
                  setTimeout(() => onNavigate("cases"), 500);
                }}
                className="inline-flex items-center gap-2 text-white text-lg font-medium hover:opacity-70 transition-opacity"
              >
                see Case Study
                <span className="w-2 h-2 rounded-full bg-white"></span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Menu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNavigate={onNavigate}
        currentView="services"
      />
    </>
  );
}
