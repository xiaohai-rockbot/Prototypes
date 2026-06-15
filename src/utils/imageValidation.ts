const MIN_DIMENSION = 500;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
}

export function validateAlbumArt(file: File): Promise<ImageValidationResult> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return Promise.resolve({ valid: false, error: 'Only JPEG or PNG images are accepted' });
  }
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;
      if (w < MIN_DIMENSION || h < MIN_DIMENSION) {
        resolve({
          valid: false,
          error: `Image too small: ${w}×${h}px — minimum is ${MIN_DIMENSION}×${MIN_DIMENSION}px`,
          width: w,
          height: h,
        });
      } else {
        resolve({ valid: true, width: w, height: h });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: 'Could not read image file' });
    };
    img.src = url;
  });
}
