export interface ArquivoCompartilhavel {
  blob: Blob;
  nome: string;
}

export function suportaCompartilharArquivos(arquivos: File[]): boolean {
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };
  if (!nav.share || !nav.canShare) return false;
  try {
    return nav.canShare({ files: arquivos });
  } catch {
    return false;
  }
}

export async function compartilharArquivos(
  arquivos: ArquivoCompartilhavel[],
  texto: string,
  titulo: string
): Promise<'ok' | 'sem-suporte' | 'erro'> {
  const files = arquivos.map(
    (a) => new File([a.blob], a.nome, { type: a.blob.type })
  );
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };
  if (!nav.share || !nav.canShare || !nav.canShare({ files })) {
    return 'sem-suporte';
  }
  try {
    await nav.share({ files, text: texto, title: titulo });
    return 'ok';
  } catch {
    return 'erro';
  }
}
