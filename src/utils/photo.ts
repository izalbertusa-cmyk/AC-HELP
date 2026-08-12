import imageCompression from 'browser-image-compression';

export async function comprimirFoto(file: File): Promise<string> {
  const comprimido = await imageCompression(file, {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    initialQuality: 0.8,
  });
  return imageCompression.getDataUrlFromFile(comprimido);
}
