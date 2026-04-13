import { useEffect, useRef } from 'react';

/**
 * Modal dialog showing assignment info, technologies, and author details.
 * Closes when the X button is clicked, the backdrop is clicked, or Escape is pressed.
 *
 * @param {object} props
 * @param {function} props.onClose - Callback to close the dialog
 */
function AboutDialog({ onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    /** Close on Escape key. */
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  /**
   * Closes when the user clicks the backdrop (outside the card).
   * @param {React.MouseEvent} e
   */
  function handleBackdropClick(e) {
    if (e.target === dialogRef.current) onClose();
  }

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="About"
    >
      <div className="bg-white border border-zinc-200 p-8 w-full max-w-md relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 transition-colors text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <p className="text-xs font-semibold text-red-700 uppercase tracking-widest mb-4">About</p>
        <h2 className="text-2xl font-black text-zinc-900 mb-4">Music Browser</h2>

        <p className="text-zinc-500 text-sm mb-6">
          COMP 4513 Assignment 2 — A music browser SPA featuring audio-profile radar charts,
          additive filtering, and Supabase-backed playlists.
        </p>

        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Technologies</h3>
        <ul className="text-zinc-600 space-y-1 mb-6 text-sm">
          <li>React 19 + Vite</li>
          <li>React Router DOM v7</li>
          <li>shadcn/ui + Tailwind CSS v4</li>
          <li>Recharts (radar chart)</li>
          <li>Supabase (auth + playlists)</li>
          <li>Node.js / Express + SQLite (music API)</li>
        </ul>

        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Author</h3>
        <p className="text-zinc-600 text-sm mb-1">Joseph D</p>
        <a
          href="https://github.com/JD-D3V/COMP4513Assign2"
          target="_blank"
          rel="noreferrer"
          className="text-red-700 hover:underline text-sm"
        >
          github.com/JD-D3V/COMP4513Assign2
        </a>
      </div>
    </div>
  );
}

export default AboutDialog;
