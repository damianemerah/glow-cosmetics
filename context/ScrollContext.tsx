"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface ScrollContextType {
  isScrolledPastHero: boolean;
  setHeroHeight: (height: number) => void;
  scrollDirection: "up" | "down" | null;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [heroHeight, setHeroHeight] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null
  );
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    // Determine scroll direction
    if (currentScrollY > lastScrollY && currentScrollY > heroHeight) {
      setScrollDirection("down");
    } else if (currentScrollY < lastScrollY) {
      setScrollDirection("up");
    }

    // Determine if scrolled past hero
    setIsScrolledPastHero(currentScrollY > heroHeight);

    setLastScrollY(currentScrollY);
  }, [lastScrollY, heroHeight]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const setHeroHeightCallback = useCallback((height: number) => {
    setHeroHeight(height);
  }, []);

  return (
    <ScrollContext.Provider
      value={{
        isScrolledPastHero,
        setHeroHeight: setHeroHeightCallback,
        scrollDirection,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll() {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
}
