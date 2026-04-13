import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '@/utils/supabase';

/**
 * Persistent site header.
 * Uses NavLink so the active route is highlighted automatically.
 * Login state is driven by the Supabase auth session in App.jsx.
 *
 * @param {object} props
 * @param {boolean} props.isLoggedIn - Whether the user is authenticated
 * @param {object|null} props.currentPlaylist - Active playlist { name, songs[] } or null
 * @param {function} props.onAbout - Callback to open the About dialog
 */
function Header({ isLoggedIn, currentPlaylist, onAbout }) {
  const navigate = useNavigate();

  /**
   * Signs the user out of Supabase and navigates to the home route.
   */
  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  /** Tailwind classes for nav links — active route gets red underline treatment. */
  function navClass({ isActive }) {
    return isActive
      ? 'text-zinc-900 font-semibold border-b-2 border-red-700 pb-0.5'
      : 'text-zinc-500 hover:text-zinc-900 transition-colors';
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-8">

        {/* Logo */}
        <NavLink to="/" className="text-zinc-900 font-black text-xl tracking-tight flex-shrink-0 uppercase">
          MusicApp
        </NavLink>

        {/* Nav */}
        <nav className="flex items-center gap-6 text-sm">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <NavLink to="/artists" className={navClass}>Artists</NavLink>
          <NavLink to="/genres" className={navClass}>Genres</NavLink>
          <NavLink to="/songs" className={navClass}>Songs</NavLink>
          {isLoggedIn && <NavLink to="/playlists" className={navClass}>Playlists</NavLink>}
          <button
            onClick={onAbout}
            className="text-zinc-500 hover:text-zinc-900 transition-colors text-sm"
          >
            About
          </button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4 text-sm flex-shrink-0">
          {isLoggedIn ? (
            <>
              {currentPlaylist && (
                <span className="text-xs text-zinc-500 border border-zinc-200 rounded px-2 py-1">
                  {currentPlaylist.name} · {currentPlaylist.songs?.length ?? 0}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className={navClass}>Login</NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
