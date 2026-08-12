import type { CatalogoDB } from '../types';

export function ehCargaDeGas(nome: string | undefined | null): boolean {
  return /^carga de g[áa]s/i.test((nome || '').trim());
}

export function ordenarCatalogo<T extends { nome: string }>(lista: T[]): T[] {
  return [...lista].sort((a, b) => {
    const fa = ehCargaDeGas(a.nome);
    const fb = ehCargaDeGas(b.nome);
    if (fa !== fb) return fa ? -1 : 1;
    if (!a.nome) return 1;
    if (!b.nome) return -1;
    return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' });
  });
}

export function novoIdCatalogo(): string {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const CATALOGO_PADRAO_PECAS: Omit<CatalogoDB, 'id'>[] = [
  { aba: 'pecas', nome: 'Carga de gás R134a', valor: '95,00', ordem: 0 },
  { aba: 'pecas', nome: 'Compressor', valor: '1200,00', ordem: 1 },
  { aba: 'pecas', nome: 'Condensador', valor: '145,00', ordem: 2 },
  { aba: 'pecas', nome: 'Evaporador', valor: '210,00', ordem: 3 },
  { aba: 'pecas', nome: 'Filtro de cabine', valor: '70,00', ordem: 4 },
  { aba: 'pecas', nome: 'Filtro Secador', valor: '740,00', ordem: 5 },
  { aba: 'pecas', nome: 'Mangueira', valor: '260,00', ordem: 6 },
  { aba: 'pecas', nome: 'Óleo Compressor', valor: '55,00', ordem: 7 },
  { aba: 'pecas', nome: 'Válvula Alta/Baixa', valor: '50,00', ordem: 8 },
  { aba: 'pecas', nome: 'Válvula Expansão', valor: '680,00', ordem: 9 },
];

export const CATALOGO_PADRAO_SERVICO: Omit<CatalogoDB, 'id'>[] = [
  { aba: 'servico', nome: 'Carga de gás R134a', valor: '180,00', ordem: 0 },
  { aba: 'servico', nome: 'Diagnóstico completo', valor: '90,00', ordem: 1 },
  { aba: 'servico', nome: 'Higienização do sistema', valor: '150,00', ordem: 2 },
  { aba: 'servico', nome: 'Retífica de tubulação', valor: '280,00', ordem: 3 },
  { aba: 'servico', nome: 'Teste de estanqueidade', valor: '120,00', ordem: 4 },
  { aba: 'servico', nome: 'Troca de compressor', valor: '450,00', ordem: 5 },
];
