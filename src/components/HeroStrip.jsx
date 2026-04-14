import { useMemo } from 'react';

/**
 * HeroStrip — a short mosaic banner of artist images with a title overlay.
 * Reused on the Artists, Genres, and Songs entry views as the required hero image.
 *
 * @param {object} props
 * @param {string} props.title - Large heading text displayed over the mosaic
 * @param {string} props.subtitle - Smaller text below the title
 * @param {string[]} props.images - Array of image URLs to tile across the strip
 * @param {number} [props.shuffleKey=0] - Increment to trigger a new random tile arrangement
 */
function HeroStrip({ title, subtitle, images = [], shuffleKey = 0 }) {
  // Shuffle images and pick 12 tiles; re-shuffles whenever shuffleKey changes
  const tiles = useMemo(() => {
    const shuffled = [...images];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return Array.from({ length: 12 }, (_, i) => shuffled[i % Math.max(shuffled.length, 1)] ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffleKey, images.length]);

  return (
    <div className="relative h-48 -mx-6 overflow-hidden mb-8">
      {/* Mosaic background */}
      <div
        className="absolute inset-0 grid gap-0.5"
        style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}
        aria-hidden="true"
      >
        {tiles.map((src, i) => (
          <div key={i} className="overflow-hidden bg-zinc-800 h-full">
            {src && (
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

      {/* Text content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-6">
        <h1 className="text-5xl font-black tracking-tight leading-none" style={{ color: '#ffffff' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default HeroStrip;
