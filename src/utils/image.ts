import imageCompression from 'browser-image-compression';
import { toPng } from 'html-to-image';

export async function fileParaFotoComprimida(file: File): Promise<string> {
  const comprimido = await imageCompression(file, {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  });
  return await imageCompression.getDataUrlFromFile(comprimido);
}

export async function nodeParaPngBlob(node: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
  const res = await fetch(dataUrl);
  return await res.blob();
}

export function dataUrlParaBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(',');
  const mimeMatch = /:(.*?);/.exec(meta);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
