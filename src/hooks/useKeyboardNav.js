import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Global keyboard navigation shortcuts.
 * Fires only when focus is not inside an input, textarea, or contenteditable.
 * Modifier keys (Ctrl, Meta, Alt) suppress the shortcut so browser bindings are preserved.
 *
 * Shortcuts:
 *   H → Home   A → Artists   G → Genres   S → Songs   P → Playlists
 */
export function useKeyboardNav() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleKey(e) {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'h': navigate('/');          window.dispatchEvent(new Event('home-reshuffle'));    break;
        case 'a': navigate('/artists');   window.dispatchEvent(new Event('artists-reshuffle')); break;
        case 'g': navigate('/genres');    window.dispatchEvent(new Event('genres-reshuffle'));  break;
        case 's': navigate('/songs');     window.dispatchEvent(new Event('songs-reshuffle'));   break;
        case 'p': navigate('/playlists'); break;
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate]);
}
