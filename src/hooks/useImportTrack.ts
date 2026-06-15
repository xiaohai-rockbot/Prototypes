import { useAdmin } from '../context/AdminContext';
import type { ImportJob } from '../types';

let jobCounter = 100;

export function useImportTrack() {
  const { dispatch } = useAdmin();

  function importTracks(
    tracks: Array<{ id: string; title: string; artist: string }>,
    genre: string,
    tags: string[],
  ) {
    const jobs: ImportJob[] = tracks.map(t => ({
      id: `job-${++jobCounter}`,
      trackId: t.id,
      trackTitle: t.title,
      trackArtist: t.artist,
      status: 'queued',
      genre,
      tags,
      enqueuedAt: new Date().toISOString(),
      completedAt: null,
      error: null,
    }));

    jobs.forEach(job => dispatch({ type: 'ADD_IMPORT_JOB', job }));

    jobs.forEach(job => {
      setTimeout(() => {
        dispatch({ type: 'UPDATE_IMPORT_JOB', jobId: job.id, status: 'processing' });
      }, 800 + Math.random() * 400);

      setTimeout(() => {
        const fail = Math.random() < 0.1;
        dispatch({
          type: 'UPDATE_IMPORT_JOB',
          jobId: job.id,
          status: fail ? 'failed' : 'imported',
          error: fail ? 'Unexpected server error during ingest' : undefined,
        });
      }, 2800 + Math.random() * 600);
    });

    dispatch({ type: 'CLEAR_SELECTION' });
  }

  function retryJob(jobId: string) {
    dispatch({ type: 'UPDATE_IMPORT_JOB', jobId, status: 'queued' });
    setTimeout(() => {
      dispatch({ type: 'UPDATE_IMPORT_JOB', jobId, status: 'processing' });
    }, 800);
    setTimeout(() => {
      dispatch({ type: 'UPDATE_IMPORT_JOB', jobId, status: 'imported' });
    }, 2800);
  }

  return { importTracks, retryJob };
}
