interface Env {
  BUCKET: R2Bucket;
}

function gerarChave(extensao: string): string {
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  return `${id}.${extensao}`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('application/pdf') && !contentType.startsWith('image/')) {
    return new Response(JSON.stringify({ erro: 'tipo de arquivo não suportado' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const extensao = contentType.startsWith('application/pdf') ? 'pdf' : 'png';
  const chave = gerarChave(extensao);
  const corpo = await request.arrayBuffer();

  if (corpo.byteLength === 0 || corpo.byteLength > 20 * 1024 * 1024) {
    return new Response(JSON.stringify({ erro: 'arquivo vazio ou grande demais' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  await env.BUCKET.put(chave, corpo, {
    httpMetadata: { contentType },
  });

  const url = new URL(request.url);
  const linkPublico = `${url.origin}/o/${chave}`;

  return new Response(JSON.stringify({ url: linkPublico }), {
    headers: { 'content-type': 'application/json' },
  });
};
