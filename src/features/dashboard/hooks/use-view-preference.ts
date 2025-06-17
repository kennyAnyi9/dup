"use client";

import { useEffect, useState } from "react";

type ViewType = "table" | "card";

const VIEW_PREFERENCE_KEY = "pastes-view-preference";

export function useViewPreference() {
  const [view, setView] = useState<ViewType>("table");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load saved preference from localStorage
    try {
      const saved = localStorage.getItem(VIEW_PREFERENCE_KEY);
      if (saved && (saved === "table" || saved === "card")) {
        setView(saved as ViewType);
      }
    } catch (error) {
      // Silent fail if localStorage is not available
      console.warn("Failed to load view preference:", error);
    }
    setIsLoaded(true);
  }, []);

  const setViewPreference = (newView: ViewType) => {
    setView(newView);
    try {
      localStorage.setItem(VIEW_PREFERENCE_KEY, newView);
    } catch (error) {
      // Silent fail if localStorage is not available
      console.warn("Failed to save view preference:", error);
    }
  };

  return {
    view,
    setView: setViewPreference,
    isLoaded,
  };
}