export function normalizarTexto(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function combina(busca: string, ...campos: string[]): boolean {
  const q = normalizarTexto(busca.trim());
  if (!q) return true;
  const alvo = normalizarTexto(campos.join(' '));
  return alvo.includes(q);
}
