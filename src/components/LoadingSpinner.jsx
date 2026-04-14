/**
 * Loading indicator displayed while async data is being fetched.
 * Shows an animated music equalizer above pulsing skeleton placeholder rows,
 * making the loading state immediately recognisable.
 *
 * @param {object} props
 * @param {string} [props.variant="rows"] - Layout variant:
 *   "rows" — table row skeletons (default)
 *   "grid" — card grid skeletons (Artists / Genres)
 *   "song" — 3-col song layout skeleton (Single Song)
 */
function Bone({ className = '' }) {
  return <div className={`bg-zinc-200 animate-pulse rounded-sm ${className}`} />;
}

function Equalizer() {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="flex items-end gap-1 h-8">
        {[0.6, 1, 0.4, 0.85, 0.5].map((scale, i) => (
          <div
            key={i}
            className="w-1.5 bg-zinc-900 rounded-sm"
            style={{
              height: `${Math.round(scale * 32)}px`,
              animation: 'eq-bounce 0.8s ease-in-out infinite alternate',
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>
      <p className="text-xs text-zinc-400 uppercase tracking-widest">Loading</p>
      <style>{`
        @keyframes eq-bounce {
          from { transform: scaleY(0.2); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

function LoadingSpinner({ variant = 'rows' }) {
  if (variant === 'grid') {
    return (
      <div className="space-y-6" role="status" aria-label="Loading">
        <Equalizer />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Bone className="aspect-square w-full" />
              <Bone className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'song') {
    return (
      <div className="space-y-8" role="status" aria-label="Loading">
        <Equalizer />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Bone className="h-2 w-16" />
                <Bone className="h-4 w-32" />
              </div>
            ))}
            <Bone className="h-10 w-full mt-2" />
          </div>
          <Bone className="aspect-square w-full" />
          <Bone className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Default: table rows
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <Equalizer />
      <div className="border border-zinc-200 divide-y divide-zinc-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-6 px-4 py-3">
            <Bone className="h-4 flex-1" />
            <Bone className="h-4 w-32" />
            <Bone className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSpinner;
