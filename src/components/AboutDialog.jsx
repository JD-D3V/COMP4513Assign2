import { useEffect, useRef } from 'react';

/**
 * Modal dialog showing assignment info, technologies, and author details.
 * Uses the native HTML &lt;dialog&gt; element as recommended by the assignment spec.
 * Closes when the X button is clicked, the backdrop is clicked, or Escape is pressed.
 *
 * @param {object} props
 * @param {function} props.onClose - Callback to close the dialog
 */
function AboutDialog({ onClose }) {
  const dialogRef = useRef(null);

  // Open the dialog when mounted
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Hook into the native 'cancel' event (fired on Escape) to keep React state in sync
  useEffect(() => {
    const el = dialogRef.current;
    function handleCancel(e) {
      e.preventDefault();
      onClose();
    }
    el?.addEventListener('cancel', handleCancel);
    return () => el?.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  // Close when clicking the native backdrop (outside the dialog box)
  function handleClick(e) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (
      rect &&
      (e.clientX < rect.left || e.clientX > rect.right ||
       e.clientY < rect.top  || e.clientY > rect.bottom)
    ) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      className="w-full max-w-md p-0 border border-zinc-200 shadow-xl backdrop:bg-black/30 open:flex flex-col m-auto"
    >
      <div className="bg-white p-8 relative">
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
          COMP 4513 Assignment 2. A music browser SPA with audio-profile radar charts,
          additive filtering, Supabase auth and playlists, dynamic hero mosaics, keyboard shortcuts, and a related-songs algorithm.
        </p>

        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Technologies</h3>
        <ul className="text-zinc-600 space-y-1 mb-6 text-sm">
          <li>React 19 + Vite</li>
          <li>React Router DOM v7</li>
          <li>shadcn/ui + Tailwind CSS v4</li>
          <li>Recharts (radar chart)</li>
          <li>Sonner (toast notifications)</li>
          <li>Supabase (auth + playlists)</li>
          <li>Node.js / Express + SQLite (music API)</li>
          <li>Geist Variable (font)</li>
        </ul>

        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Third-Party Libraries</h3>
        <ul className="text-zinc-600 space-y-1 mb-6 text-sm">
          <li>
            <a href="https://recharts.org" target="_blank" rel="noreferrer" className="text-red-700 hover:underline">Recharts</a>
            {' '}· radar chart for audio analytics
          </li>
          <li>
            <a href="https://sonner.emilkowal.ski" target="_blank" rel="noreferrer" className="text-red-700 hover:underline">Sonner</a>
            {' '}· toast notifications
          </li>
          <li>
            <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer" className="text-red-700 hover:underline">shadcn/ui</a>
            {' '}· UI components (Table, Badge, Button, Input)
          </li>
          <li>
            <a href="https://vercel.com/font" target="_blank" rel="noreferrer" className="text-red-700 hover:underline">Geist Variable</a>
            {' '}· typeface
          </li>
        </ul>

        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Author</h3>
        <p className="text-zinc-600 text-sm mb-1">Joseph Mills</p>
        <a
          href="https://github.com/JD-D3V/COMP4513Assign2"
          target="_blank"
          rel="noreferrer"
          className="text-red-700 hover:underline text-sm"
        >
          github.com/JD-D3V/COMP4513Assign2
        </a>
      </div>
    </dialog>
  );
}

export default AboutDialog;
