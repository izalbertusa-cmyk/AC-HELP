import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function gerarPngDoDocumento(node: HTMLElement): Promise<string> {
  return toPng(node, { pixelRatio: 2, backgroundColor: '#ffffff' });
}

export async function gerarPdfDoDocumento(node: HTMLElement): Promise<Blob> {
  const dataUrl = await gerarPngDoDocumento(node);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Falha ao carregar imagem do documento'));
    img.src = dataUrl;
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const ratio = img.width / img.height;
  let renderWidth = pageWidth - 20;
  let renderHeight = renderWidth / ratio;
  if (renderHeight > pageHeight - 20) {
    renderHeight = pageHeight - 20;
    renderWidth = renderHeight * ratio;
  }
  const x = (pageWidth - renderWidth) / 2;
  const y = 10;

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  pdf.addImage(dataUrl, 'PNG', x, y, renderWidth, renderHeight);
  return pdf.output('blob');
}

export function dataUrlParaBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(',');
  const mime = meta.match(/data:(.*?);base64/)?.[1] ?? 'image/png';
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
