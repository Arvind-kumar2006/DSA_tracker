import { useEffect } from 'react';

export function useKeyboardShortcuts({ onNew, onSearch, onEscape, enabled = true }) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') onEscape?.();
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onNew?.();
      }
      if (e.key === '/') {
        e.preventDefault();
        onSearch?.();
      }
      if (e.key === 'Escape') onEscape?.();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNew, onSearch, onEscape, enabled]);
}
