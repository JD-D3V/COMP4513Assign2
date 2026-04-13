import { supabase } from '@/utils/supabase';
import { toast } from 'sonner';

/**
 * Custom hook encapsulating playlist add/remove with Supabase persistence.
 * Eliminates duplicated logic across SongsView, SingleSongView,
 * SingleArtistView, SingleGenreView, and PlaylistView.
 *
 * @param {object|null} currentPlaylist - Active playlist { id, name, songs[] }
 * @param {function} setCurrentPlaylist - State setter from App.jsx
 * @returns {{ addSong: function, removeSong: function }}
 */
export function usePlaylist(currentPlaylist, setCurrentPlaylist) {
  /**
   * Adds a song to the active playlist.
   * Persists the addition to the Supabase playlist_songs table,
   * then updates local React state on success.
   *
   * @param {object} song - Song object from the API (must have an `id` field)
   */
  async function addSong(song) {
    if (!currentPlaylist) {
      toast.warning('Select a playlist first in the Playlists view.');
      return;
    }

    const songId = song.song_id ?? song.id;
    const already = currentPlaylist.songs?.some((s) => (s.song_id ?? s.id) === songId);
    if (already) {
      toast.info(`"${song.title}" is already in the playlist.`);
      return;
    }

    const { error } = await supabase
      .from('playlist_songs')
      .insert({ playlist_id: currentPlaylist.id, song_id: songId });

    if (error) {
      toast.error('Error saving to playlist.');
      return;
    }

    setCurrentPlaylist((prev) => ({
      ...prev,
      songs: [...(prev.songs ?? []), song],
    }));
    toast.success(`Added "${song.title}" to ${currentPlaylist.name}.`);
  }

  /**
   * Removes a song from the active playlist.
   * Deletes the entry from Supabase playlist_songs,
   * then updates local React state on success.
   *
   * @param {object} song - Song object to remove (must have an `id` field)
   */
  async function removeSong(song) {
    if (!currentPlaylist) return;

    const songId = song.song_id ?? song.id;

    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', currentPlaylist.id)
      .eq('song_id', songId);

    if (error) {
      toast.error('Error removing song.');
      return;
    }

    setCurrentPlaylist((prev) => ({
      ...prev,
      songs: prev.songs.filter((s) => (s.song_id ?? s.id) !== songId),
    }));
    toast.success(`Removed "${song.title}" from ${currentPlaylist.name}.`);
  }

  return { addSong, removeSong };
}
