"use client";

import { useState, useEffect } from "react";
import { ViewType } from "@/shared/types/ui";

const VIEW_PREFERENCE_KEY = "pastes-view-preference";

export function useViewPreference() {
  const [view, setView] = useState<ViewType>("table");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load preference from localStorage after mount (client-side only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_PREFERENCE_KEY);
      if (saved && (saved === "table" || saved === "card")) {
        setView(saved as ViewType);
      }
    } catch (error) {
      console.warn("Failed to load view preference:", error);
    }
    setIsInitialized(true);
  }, []);

  const setViewPreference = (newView: ViewType) => {
    setView(prev => {
      if (prev === newView) return prev;
      return newView;
    });
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
  };
}