import { useAdmin } from '../context/AdminContext';
import { mockRockbotSongs } from '../data/mockRockbot';

export function useMatchISRC() {
  const { dispatch } = useAdmin();

  function matchTrack(trackId: string, isrc: string) {
    dispatch({ type: 'SET_MATCH_RESULT', trackId, result: { status: 'searching', matchedSong: null } });

    setTimeout(() => {
      const match = mockRockbotSongs.find(s => s.isrc === isrc) ?? null;
      dispatch({
        type: 'SET_MATCH_RESULT',
        trackId,
        result: { status: match ? 'matched' : 'no-match', matchedSong: match },
      });
    }, 1200);
  }

  function matchAll(tracks: Array<{ id: string; isrc: string }>) {
    tracks.forEach(t => {
      dispatch({ type: 'SET_MATCH_RESULT', trackId: t.id, result: { status: 'searching', matchedSong: null } });
    });
    setTimeout(() => {
      tracks.forEach(t => {
        const match = mockRockbotSongs.find(s => s.isrc === t.isrc) ?? null;
        dispatch({
          type: 'SET_MATCH_RESULT',
          trackId: t.id,
          result: { status: match ? 'matched' : 'no-match', matchedSong: match },
        });
      });
    }, 1400);
  }

  return { matchTrack, matchAll };
}
