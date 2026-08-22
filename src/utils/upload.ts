export async function enviarParaR2(blob: Blob): Promise<string> {
  const token = import.meta.env.VITE_UPLOAD_TOKEN as string | undefined;
  const resposta = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'content-type': blob.type,
      ...(token ? { 'x-app-token': token } : {}),
    },
    body: blob,
  });
  if (!resposta.ok) {
    throw new Error('Falha ao enviar orçamento para o servidor');
  }
  const dados = (await resposta.json()) as { url: string };
  return dados.url;
}
