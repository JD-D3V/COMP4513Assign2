import { useState } from 'react';

/**
 * Persistent site footer shown on all views.
 * A fixed keyboard shortcut hint floats in the bottom-left corner of the viewport.
 */
function Footer() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <>
      <footer className="border-t border-zinc-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-center text-xs text-zinc-400">
          COMP 4513 Assignment 2 ·{' '}
          <a
            href="https://github.com/JD-D3V/COMP4513Assign2"
            target="_blank"
            rel="noreferrer"
            className="text-red-700 hover:underline ml-1"
          >
            GitHub Repo
          </a>
        </div>
      </footer>

      {/* Fixed keyboard shortcut hint — bottom-left corner */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          className="w-7 h-7 rounded-full border border-zinc-300 bg-white text-zinc-400 hover:border-zinc-600 hover:text-zinc-700 transition-colors flex items-center justify-center text-xs shadow-sm"
          aria-label="Keyboard shortcuts"
          onMouseEnter={() => setShowShortcuts(true)}
          onMouseLeave={() => setShowShortcuts(false)}
        >
          ?
        </button>

        {/* Tooltip — appears above the button */}
        {showShortcuts && (
          <div className="absolute bottom-full left-0 mb-2 pointer-events-none z-50">
            <div className="bg-zinc-900 text-white text-xs p-3 w-44 shadow-xl">
              <p className="font-semibold text-zinc-300 mb-2 uppercase tracking-widest text-[10px]">Shortcuts</p>
              {[
                ['H', 'Home'],
                ['A', 'Artists'],
                ['G', 'Genres'],
                ['S', 'Songs'],
                ['P', 'Playlists'],
              ].map(([key, label]) => (
                <div key={key} className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-400">{label}</span>
                  <kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 text-[10px] font-mono">{key}</kbd>
                </div>
              ))}
            </div>
            {/* Arrow */}
            <div className="absolute bottom-[-4px] left-3 w-2 h-2 bg-zinc-900 rotate-45" />
          </div>
        )}
      </div>
    </>
  );
}

export default Footer;
