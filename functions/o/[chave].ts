interface Env {
  BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const chave = context.params.chave as string;
  const objeto = await context.env.BUCKET.get(chave);

  if (!objeto) {
    return new Response('Orçamento não encontrado ou o link expirou (90 dias).', { status: 404 });
  }

  const headers = new Headers();
  objeto.writeHttpMetadata(headers);
  headers.set('cache-control', 'public, max-age=604800, immutable');
  headers.set('content-disposition', `inline; filename="${chave}"`);

  return new Response(objeto.body, { headers });
};
