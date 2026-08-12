import { useRef } from 'react';
import type { AbaCatalogo, CatalogoDB, OficinaDados } from '../types';
import { db } from '../db/db';
import { novoIdCatalogo, ordenarCatalogo } from '../utils/catalogo';
import { normalizarValor, sanitizarEntradaValor } from '../utils/money';

interface AjustesScreenProps {
  oficina: OficinaDados;
  catalogo: CatalogoDB[];
  aba: AbaCatalogo;
  editandoIdCatalogo: string | null;
  onSetAba: (a: AbaCatalogo) => void;
  onSetEditandoIdCatalogo: (id: string | null) => void;
}

export default function AjustesScreen({
  oficina,
  catalogo,
  aba,
  editandoIdCatalogo,
  onSetAba,
  onSetEditandoIdCatalogo,
}: AjustesScreenProps) {
  const criandoItemRef = useRef(false);
  const itensDaAba = catalogo.filter((c) => c.aba === aba);
  const listaExibida = editandoIdCatalogo
    ? [...itensDaAba].sort((a, b) => a.ordem - b.ordem)
    : ordenarCatalogo(itensDaAba);

  async function atualizarOficina(campo: keyof OficinaDados, valor: string) {
    await db.oficina.update(1, { [campo]: valor });
  }

  async function handleFocarLinha(id: string) {
    onSetEditandoIdCatalogo(id);
  }

  async function handleDesfocarLinha(id: string) {
    const atual = await db.catalogo.get(id);
    const completo = !!(atual?.nome ?? '').trim() && !!(atual?.valor ?? '').trim();
    onSetEditandoIdCatalogo(completo ? null : id);
  }

  async function setNomeCatalogo(id: string, nome: string) {
    await db.catalogo.update(id, { nome });
  }

  async function setValorCatalogo(id: string, valor: string) {
    await db.catalogo.update(id, { valor: sanitizarEntradaValor(valor) });
  }

  async function blurValorCatalogo(id: string) {
    const atual = await db.catalogo.get(id);
    if (!atual) return;
    await db.catalogo.update(id, { valor: normalizarValor(atual.valor) });
    const completo = !!(atual.nome ?? '').trim() && !!normalizarValor(atual.valor).trim();
    onSetEditandoIdCatalogo(completo ? null : id);
  }

  async function removerCatalogo(id: string) {
    await db.catalogo.delete(id);
  }

  async function novoItemCatalogo() {
    if (criandoItemRef.current) return;
    criandoItemRef.current = true;
    try {
      const atuais = await db.catalogo.where('aba').equals(aba).toArray();
      const temLinhaSemNome = atuais.some((c) => !c.nome.trim());
      if (temLinhaSemNome) return;
      const maiorOrdem = atuais.reduce((m, c) => Math.max(m, c.ordem), 0);
      const id = novoIdCatalogo();
      await db.catalogo.add({ id, aba, nome: '', valor: '', ordem: maiorOrdem + 1 });
      onSetEditandoIdCatalogo(id);
    } finally {
      criandoItemRef.current = false;
    }
  }

  return (
    <div className="tela">
      <div className="card">
        <div className="card-label" style={{ marginBottom: 12 }}>
          Dados da oficina
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="logo-placeholder">logo da oficina</div>
          <input
            value={oficina.nome}
            onChange={(e) => atualizarOficina('nome', e.target.value)}
            placeholder="Nome da oficina"
            className="field"
            style={{ flex: 1, minWidth: 0, font: '700 16px/1 Barlow', padding: '13px 12px' }}
          />
        </div>
        <input
          value={oficina.endereco}
          onChange={(e) => atualizarOficina('endereco', e.target.value)}
          placeholder="Endereço"
          className="field"
          style={{ marginTop: 9, font: '500 14.5px/1 Barlow' }}
        />
        <input
          value={oficina.fone}
          onChange={(e) => atualizarOficina('fone', e.target.value)}
          placeholder="Telefone / WhatsApp"
          className="field"
          style={{ marginTop: 9, font: '500 14.5px/1 Barlow' }}
        />
        <input
          value={oficina.condicoes}
          onChange={(e) => atualizarOficina('condicoes', e.target.value)}
          placeholder="Condições do orçamento"
          className="field"
          style={{ marginTop: 9, font: '500 13.5px/1.4 Barlow' }}
        />
        <div style={{ font: '400 11.5px/1.5 Barlow', color: 'var(--texto-secundario)', marginTop: 8 }}>
          Aparece no rodapé de todo orçamento enviado.
        </div>
      </div>

      <div className="abas" style={{ marginTop: 20 }}>
        {(
          [
            ['pecas', 'Peças', 'var(--laranja)'],
            ['servico', 'Mão de obra', 'var(--azul)'],
          ] as const
        ).map(([k, nome, cor]) => (
          <button
            key={k}
            type="button"
            className="aba"
            style={{ background: aba === k ? cor : undefined, color: aba === k ? '#fff' : undefined }}
            onClick={() => onSetAba(k)}
          >
            {nome}
          </button>
        ))}
      </div>

      <div className="catalogo-edit-card" style={{ marginTop: 12 }}>
        {listaExibida.map((c) => (
          <div key={c.id} className="catalogo-edit-row">
            <input
              className="nome"
              value={c.nome}
              placeholder="Nome do item"
              onFocus={() => handleFocarLinha(c.id!)}
              onBlur={() => handleDesfocarLinha(c.id!)}
              onChange={(e) => setNomeCatalogo(c.id!, e.target.value)}
            />
            <div className="pill-valor pill-valor--sm">
              <span className="pill-valor__prefixo">R$</span>
              <input
                className="pill-valor__input"
                value={c.valor}
                inputMode="decimal"
                placeholder="0,00"
                onFocus={() => handleFocarLinha(c.id!)}
                onChange={(e) => setValorCatalogo(c.id!, e.target.value)}
                onBlur={() => blurValorCatalogo(c.id!)}
              />
            </div>
            <button type="button" className="btn-remover" onClick={() => removerCatalogo(c.id!)}>
              ×
            </button>
          </div>
        ))}
        <button type="button" className="novo-item-btn" onClick={novoItemCatalogo}>
          + Novo item no catálogo
        </button>
      </div>
      <div style={{ font: '400 12px/1.5 Barlow', color: 'var(--texto-secundario)', margin: '10px 4px 0' }}>
        O valor aqui é só sugestão — dá pra mudar em cada orçamento.
      </div>
    </div>
  );
}
