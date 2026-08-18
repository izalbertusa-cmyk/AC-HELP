export async function enviarParaR2(blob: Blob): Promise<string> {
  const resposta = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'content-type': blob.type },
    body: blob,
  });
  if (!resposta.ok) {
    throw new Error('Falha ao enviar orçamento para o servidor');
  }
  const dados = (await resposta.json()) as { url: string };
  return dados.url;
}
