export const SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aiff', '.aif'];
export const SUPPORTED_AUDIO_ACCEPT = '.mp3,.wav,.flac,.aiff,.aif,audio/mpeg,audio/wav,audio/flac,audio/aiff,audio/x-aiff';

export function isSupportedAudioFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return SUPPORTED_AUDIO_EXTENSIONS.some(ext => lower.endsWith(ext));
}

export function isNonMp3Audio(filename: string): boolean {
  return isSupportedAudioFile(filename) && !filename.toLowerCase().endsWith('.mp3');
}

export function detectDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(audio.duration * 1000));
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read audio metadata'));
    };
    audio.src = url;
  });
}
