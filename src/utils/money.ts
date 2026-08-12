export function parseValor(v: string | undefined | null): number {
  if (!v) return 0;
  const cleaned = String(v).replace(/\./g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export function normalizarValor(v: string | undefined | null): string {
  if (v === undefined || v === null || String(v).trim() === '') return '';
  return parseValor(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatarBRL(n: number): string {
  return (
    'R$ ' +
    n.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function sanitizarEntradaValor(v: string): string {
  return v.replace(/[^0-9.,]/g, '');
}
