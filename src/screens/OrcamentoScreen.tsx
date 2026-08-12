import { useRef } from 'react';
import type { AbaCatalogo, CatalogoDB, FotoOrcamento, ItemOrcamento } from '../types';
import { db } from '../db/db';
import { novoIdCatalogo, ordenarCatalogo } from '../utils/catalogo';
import { formatarBRL, normalizarValor, sanitizarEntradaValor } from '../utils/money';
import { comprimirFoto } from '../utils/photo';

interface OrcamentoScreenProps {
  itens: ItemOrcamento[];
  fotos: FotoOrcamento[];
  aba: AbaCatalogo;
  catalogo: CatalogoDB[];
  editandoIdCatalogo: string | null;
  editCatalogoAberto: boolean;
  totalNum: number;
  onSetAba: (a: AbaCatalogo) => void;
  onAdicionarItem: (nome: string, valor: string) => void;
  onSetValorItem: (id: string, valor: string) => void;
  onRemoverItem: (id: string) => void;
  onSetFotos: (fn: (prev: FotoOrcamento[]) => FotoOrcamento[]) => void;
  onSetEditandoIdCatalogo: (id: string | null) => void;
  onSetEditCatalogoAberto: (v: boolean) => void;
  onGerarOrcamento: () => void;
}

const MAX_FOTOS = 6;

export default function OrcamentoScreen({
  itens,
  fotos,
  aba,
  catalogo,
  editandoIdCatalogo,
  editCatalogoAberto,
  totalNum,
  onSetAba,
  onAdicionarItem,
  onSetValorItem,
  onRemoverItem,
  onSetFotos,
  onSetEditandoIdCatalogo,
  onSetEditCatalogoAberto,
  onGerarOrcamento,
}: OrcamentoScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const criandoItemRef = useRef(false);

  const itensDaAba = catalogo.filter((c) => c.aba === aba);
  const listaExibida = editandoIdCatalogo
    ? [...itensDaAba].sort((a, b) => a.ordem - b.ordem)
    : ordenarCatalogo(itensDaAba);

  const usados = new Set(itens.map((i) => i.nome));
  const chipsDisponiveis = ordenarCatalogo(itensDaAba).filter((c) => c.nome && !usados.has(c.nome));

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

  async function novoItemRapido() {
    onSetEditCatalogoAberto(true);
    await novoItemCatalogo();
  }

  async function handleFotosSelecionadas(files: FileList | null) {
    if (!files || files.length === 0) return;
    const espacoRestante = MAX_FOTOS - fotos.length;
    const selecionados = Array.from(files).slice(0, Math.max(0, espacoRestante));
    for (const file of selecionados) {
      try {
        const dataUrl = await comprimirFoto(file);
        onSetFotos((prev) => [
          ...prev,
          { id: 'f' + Date.now() + Math.random().toString(36).slice(2, 6), dataUrl },
        ]);
      } catch {
        // ignora foto que falhar ao comprimir
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="tela">
      <div className="card-label" style={{ marginBottom: 10 }}>
        Itens do orçamento
      </div>
      {itens.length === 0 && (
        <div className="vazio">
          Nenhum item ainda.
          <br />
          Escolhe abaixo no catálogo da oficina.
        </div>
      )}
      {itens.map((it) => (
        <div key={it.id} className="item-orcamento">
          <div
            className="item-orcamento__barra"
            style={{ background: it.tipo === 'Peça' ? 'var(--laranja)' : 'var(--azul)' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="item-orcamento__nome">{it.nome}</div>
            <div className="item-orcamento__tipo">{it.tipo}</div>
          </div>
          <div className="pill-valor">
            <span className="pill-valor__prefixo">R$</span>
            <input
              className="pill-valor__input"
              value={it.valor}
              inputMode="decimal"
              onChange={(e) => onSetValorItem(it.id, sanitizarEntradaValor(e.target.value))}
              onBlur={() => onSetValorItem(it.id, normalizarValor(it.valor))}
            />
          </div>
          <button type="button" className="btn-remover" onClick={() => onRemoverItem(it.id)}>
            ×
          </button>
        </div>
      ))}

      <div className="abas">
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

      <div className="section-label-row">
        <div className="card-label">Catálogo da oficina</div>
        <button
          type="button"
          className="link-laranja"
          onClick={() => onSetEditCatalogoAberto(!editCatalogoAberto)}
        >
          {editCatalogoAberto ? 'Concluir' : 'Editar catálogo'}
        </button>
      </div>

      {editCatalogoAberto ? (
        <div className="catalogo-edit-card">
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
      ) : (
        <div className="catalogo-chips">
          {chipsDisponiveis.map((c) => (
            <button
              key={c.id}
              type="button"
              className="catalogo-chip"
              onClick={() => onAdicionarItem(c.nome, c.valor)}
            >
              <span style={{ color: 'var(--laranja)', fontWeight: 700 }}>+</span>
              {c.nome}
            </button>
          ))}
          <button type="button" className="chip chip--tracejado" onClick={novoItemRapido}>
            + Novo item
          </button>
        </div>
      )}

      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-label">Fotos do serviço</div>
          <button
            type="button"
            className="link-laranja"
            style={{ fontSize: 12 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={fotos.length >= MAX_FOTOS}
          >
            + Tirar foto
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          hidden
          onChange={(e) => handleFotosSelecionadas(e.target.files)}
        />
        <div className="fotos-grid">
          {fotos.map((f, i) => (
            <button
              key={f.id}
              type="button"
              className="foto-tile"
              onClick={() => onSetFotos((prev) => prev.filter((x) => x.id !== f.id))}
              aria-label={`Remover foto ${i + 1}`}
            >
              <img src={f.dataUrl} alt={`Foto ${i + 1} do serviço`} />
            </button>
          ))}
          {fotos.length < MAX_FOTOS && (
            <button
              type="button"
              className="foto-tile foto-tile--add"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Adicionar foto"
            >
              ＋
            </button>
          )}
        </div>
      </div>

      <div style={{ height: 90 }} />

      <div className="barra-total-wrap">
        <div className="barra-total">
          <div style={{ flex: 1 }}>
            <div className="barra-total__label">Total ({itens.length} itens)</div>
            <div className="barra-total__valor">{formatarBRL(totalNum)}</div>
          </div>
          <button type="button" className="barra-total__cta" onClick={onGerarOrcamento}>
            Gerar orçamento
          </button>
        </div>
      </div>
    </div>
  );
}
