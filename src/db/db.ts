import Dexie, { type EntityTable } from 'dexie';
import type {
  OficinaDados,
  VeiculoLocal,
  OrcamentoSalvo,
  CatalogoDB,
  TopicoRelato,
} from '../types';
import {
  CATALOGO_PADRAO_PECAS,
  CATALOGO_PADRAO_SERVICO,
  novoIdCatalogo,
} from '../utils/catalogo';

const TOPICOS_PADRAO = [
  'Não gela',
  'Cheiro ruim',
  'Barulho',
  'Pinga água',
  'Liga e desliga',
  'Ventilação fraca',
];

class AcHelpDB extends Dexie {
  oficina!: EntityTable<OficinaDados, 'id'>;
  veiculosLocais!: EntityTable<VeiculoLocal, 'placa'>;
  orcamentos!: EntityTable<OrcamentoSalvo, 'id'>;
  catalogo!: EntityTable<CatalogoDB, 'id'>;
  topicos!: EntityTable<TopicoRelato, 'id'>;

  constructor() {
    super('ac-help-db');
    this.version(1).stores({
      oficina: 'id',
      veiculosLocais: 'placa',
      orcamentos: '++id, placa, criadoEm, cliente',
      catalogo: 'id, aba, ordem',
      topicos: '++id, nome',
    });
  }
}

export const db = new AcHelpDB();

let seedPromise: Promise<void> | null = null;

export function garantirSeed(): Promise<void> {
  if (!seedPromise) seedPromise = executarSeed();
  return seedPromise;
}

async function executarSeed(): Promise<void> {
  const ofCount = await db.oficina.count();
  if (ofCount === 0) {
    await db.oficina.put({
      id: 1,
      nome: 'Ar Frio Climatização',
      endereco: 'Rua das Oficinas, 240 — Osasco/SP',
      fone: '(11) 9 4002-8922',
      condicoes: 'Validade 7 dias · Garantia de 90 dias no serviço · Até 3x sem juros',
    });
  }

  const catCount = await db.catalogo.count();
  if (catCount === 0) {
    const registros: CatalogoDB[] = [
      ...CATALOGO_PADRAO_PECAS,
      ...CATALOGO_PADRAO_SERVICO,
    ].map((c) => ({ ...c, id: novoIdCatalogo() }));
    await db.catalogo.bulkPut(registros);
  }

  const topCount = await db.topicos.count();
  if (topCount === 0) {
    await db.topicos.bulkPut(TOPICOS_PADRAO.map((nome) => ({ nome })));
  }
}
