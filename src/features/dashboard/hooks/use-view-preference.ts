"use client";

import { useState } from "react";

type ViewType = "table" | "card";

const VIEW_PREFERENCE_KEY = "pastes-view-preference";

function getInitialViewPreference(): ViewType {
  try {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(VIEW_PREFERENCE_KEY);
      if (saved && (saved === "table" || saved === "card")) {
        return saved as ViewType;
      }
    }
  } catch (error) {
    // Silent fail if localStorage is not available
    console.warn("Failed to load view preference:", error);
  }
  return "table";
}

export function useViewPreference() {
  const [view, setView] = useState<ViewType>(getInitialViewPreference);

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