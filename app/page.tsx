"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomePage from "./components/home";
import Cases from "./components/cases";
import Services from "./components/services";
import Technologies from "./components/technologies";
import Pitch from "./components/pitch";
import LoadingScreen from "./components/loadingScreen";

type View = "home" | "cases" | "services" | "technologies" | "contact";

export default function Page() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [loading, setLoading] = useState(true);
  const [showCookies, setShowCookies] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setShowCookies(true), 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {currentView === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HomePage onNavigate={handleNavigate} />
          </motion.div>
        )}
        {currentView === "cases" && (
          <motion.div
            key="cases"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Cases onNavigate={handleNavigate} />
          </motion.div>
        )}
        {currentView === "services" && (
          <motion.div
            key="services"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Services onNavigate={handleNavigate} />
          </motion.div>
        )}
        {currentView === "technologies" && (
          <motion.div
            key="technologies"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Technologies onNavigate={handleNavigate} />
          </motion.div>
        )}
        {currentView === "contact" && (
          <motion.div
            key="contact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Pitch onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCookies && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-3 left-6 right-6 md:left-auto md:right-6 md:max-w-md bg-white rounded-lg shadow-2xl p-6 z-[100]"
          >
            <p className="text-[#2D2FE8] text-sm mb-4 leading-relaxed">
              We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
            </p>
            <div className="flex gap-8 items-center">
              <button
                onClick={() => setShowCookies(false)}
                className="text-[#2D2FE8] text-sm hover:opacity-70 transition-opacity"
              >
                Decline
              </button>
              <button
                onClick={() => setShowCookies(false)}
                className="text-[#2D2FE8] text-sm font-medium hover:opacity-70 transition-opacity flex items-center gap-2"
              >
                Accept
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
