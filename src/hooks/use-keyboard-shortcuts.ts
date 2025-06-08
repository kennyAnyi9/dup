"use client";

import { useEffect, useRef } from "react";

interface KeyboardShortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const callbacksRef = useRef(shortcuts);
  
  // Update callbacks ref when shortcuts change
  useEffect(() => {
    callbacksRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Don't trigger shortcuts when user is typing in inputs
      const target = event.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.contentEditable === 'true' ||
                      target.isContentEditable;

      for (const shortcut of callbacksRef.current) {
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesMeta = !!shortcut.metaKey === !!event.metaKey;
        const matchesCtrl = !!shortcut.ctrlKey === !!event.ctrlKey;
        const matchesShift = !!shortcut.shiftKey === !!event.shiftKey;
        const matchesAlt = !!shortcut.altKey === !!event.altKey;

        if (matchesKey && matchesMeta && matchesCtrl && matchesShift && matchesAlt) {
          // Special handling for certain shortcuts that should work even when typing
          const alwaysActive = shortcut.key.toLowerCase() === 'escape';
          
          if (!isTyping || alwaysActive) {
            if (shortcut.preventDefault !== false) {
              event.preventDefault();
            }
            shortcut.callback(event);
            break;
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}

export function isMac() {
  return typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

export function getModifierKey() {
  return isMac() ? '⌘' : 'Ctrl';
}

export function formatShortcut(shortcut: KeyboardShortcut) {
  const parts: string[] = [];
  
  if (shortcut.metaKey) parts.push(isMac() ? '⌘' : 'Ctrl');
  if (shortcut.ctrlKey && !shortcut.metaKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push(isMac() ? '⌥' : 'Alt');
  if (shortcut.shiftKey) parts.push('⇧');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(isMac() ? '' : '+');
}