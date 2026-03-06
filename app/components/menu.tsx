"use client";

import { useEffect, useState } from "react";

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: "home" | "cases" | "services" | "technologies" | "contact") => void;
  currentView: "home" | "cases" | "services" | "technologies" | "contact";
}

export default function Menu({ isOpen, onClose, onNavigate, currentView }: MenuProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimating(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const menuItems = [
    { label: "Home", view: "home" as const },
    { label: "Cases", view: "cases" as const },
    { label: "Services", view: "services" as const },
    { label: "Technologies", view: "technologies" as const },
    { label: "Contact", view: "contact" as const },
  ];

  const waterFlowPath = isAnimating
    ? "M 100 0 L -25 0 C -15 8, -45 15, -20 25 C 5 35, -55 42, -15 52 C 15 62, -40 72, -25 82 C -10 88, -30 95, -20 100 L 100 100 Z"
    : "M 100 0 L 100 0 C 100 8, 100 15, 100 25 C 100 35, 100 42, 100 52 C 100 62, 100 72, 100 82 C 100 88, 100 95, 100 100 L 100 100 Z";

  const secondaryViscousPath = isAnimating
    ? "M 100 0 L -15 0 C 0 12, -25 22, -5 32 C 10 42, -35 52, 0 62 C 20 72, -20 82, -5 92 C 5 97, -10 100, 0 100 L 100 100 Z"
    : "M 100 0 L 100 0 C 100 12, 100 22, 100 32 C 100 42, 100 52, 100 62 C 100 72, 100 82, 100 92 C 100 97, 100 100, 100 100 L 100 100 Z";

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden pointer-events-none">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-1000 ease-in-out pointer-events-auto ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          className="fill-white/10 transition-all duration-[2200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          d={secondaryViscousPath}
        />
        <path
          className="fill-[#2D2FE8] transition-all duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          d={waterFlowPath}
        />
      </svg>

      <div
        className={`relative w-full h-full flex flex-col items-center justify-center transition-opacity duration-700 pointer-events-auto ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-12 right-12 text-white group p-4 z-[110]"
          aria-label="Close"
        >
          <div className="w-12 h-px bg-white/40 relative overflow-hidden group-hover:bg-white transition-all duration-300">
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 border-t-2 border-r-2 border-white/60 group-hover:border-white rotate-45 transition-all duration-300"></div>
          </div>
        </button>

        <nav className="flex flex-col gap-3 md:gap-5 items-center text-center">
          {menuItems.map((item, index) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.view);
                  onClose();
                }}
                style={{
                  transitionDelay: isAnimating ? `${index * 80 + 800}ms` : "0ms",
                  transform: isAnimating ? "translateY(0)" : "translateY(25px)",
                  opacity: isAnimating ? (isActive ? 1 : 0.5) : 0,
                }}
                className="group relative px-10 py-1 transition-all duration-[700ms] ease-out hover:opacity-100"
              >
                <span
                  className={`text-white transition-all duration-300 block uppercase tracking-tighter leading-none ${
                    isActive
                      ? "text-2xl md:text-5xl font-[900] scale-110"
                      : "text-xl md:text-3xl font-bold opacity-70 group-hover:opacity-100 group-hover:scale-105"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-6 h-[2px] bg-white/60 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
