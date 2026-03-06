"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [showLoading, setShowLoading] = useState(true);
  const [showCookies, setShowCookies] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShowCookies(true);
    }
  }, []);

  const finishLoading = () => {
    setShowLoading(false);
    onComplete();

    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShowCookies(true);
    }
  };

  const handleConsent = (value: "accept" | "decline") => {
    localStorage.setItem("cookie_consent", value);
    setShowCookies(false);
  };

  return (
    <>
      {/* LOADING SCREEN */}
      <AnimatePresence>
        {showLoading && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#2D2FE8] flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute top-8 left-8">
              <h1 className="text-white text-2xl font-bold tracking-wider">
                361°
              </h1>
            </div>

            <button
              className="absolute top-8 right-8 text-white text-base font-bold tracking-wide uppercase flex items-center gap-2 hover:opacity-70"
              onClick={finishLoading}
            >
              SKIP
              <svg width="22" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute w-[70vw] h-[70vw] max-w-[400px] max-h-[400px]"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-full h-full" viewBox="0 0 400 400">
                  <circle cx="200" cy="200" r="190" fill="none" stroke="white" strokeWidth="2" />
                  <rect x="195" y="10" width="10" height="30" fill="white" />
                </svg>
              </motion.div>

              <motion.button
                className="relative z-10 px-12 py-4 border-2 border-white text-white font-medium tracking-widest hover:bg-white hover:text-[#2D2FE8] transition-all"
                onClick={finishLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                PLAY
              </motion.button>
            </div>

            <div className="absolute bottom-8 left-8 text-white text-xs tracking-wider">
              SOFTWARE HOUSE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COOKIE BANNER */}
      <AnimatePresence>
        {showCookies && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md bg-white rounded-lg shadow-2xl p-6 z-[100]"
          >
            <p className="text-[#2D2FE8] text-sm mb-4 leading-relaxed">
              We use cookies to enhance your experience. By continuing, you agree
              to our use of cookies.
            </p>

            <div className="flex gap-8 items-center">
              <button
                onClick={() => handleConsent("decline")}
                className="text-[#2D2FE8] text-sm hover:opacity-70"
              >
                Decline
              </button>

              <button
                onClick={() => handleConsent("accept")}
                className="text-[#2D2FE8] text-sm font-medium hover:opacity-70 flex items-center gap-2"
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
