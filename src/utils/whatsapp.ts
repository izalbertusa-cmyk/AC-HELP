export function digitosTelefone(fone: string): string {
  return (fone || '').replace(/\D/g, '');
}

export function montarLinkWhatsapp(fone: string, texto: string): string {
  let digitos = digitosTelefone(fone);
  if (digitos.length === 10 || digitos.length === 11) digitos = '55' + digitos;
  const params = texto ? `?text=${encodeURIComponent(texto)}` : '';
  return `https://wa.me/${digitos}${params}`;
}

export function baixarArquivo(blob: Blob, nome: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
