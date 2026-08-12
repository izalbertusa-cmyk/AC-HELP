import { useMemo, useRef, useState } from 'react';
import type { FotoOrcamento, ItemOrcamento, OficinaDados, Veiculo } from '../types';
import { formatarBRL } from '../utils/money';
import { gerarPdfOrcamento } from '../utils/pdf';
import { gerarPngDoDocumento, dataUrlParaBlob } from '../utils/documento';
import { montarLinkWhatsapp, baixarArquivo } from '../utils/whatsapp';

interface PreviewScreenProps {
  oficina: OficinaDados;
  numero: string;
  cliente: string;
  fone: string;
  veiculo: Veiculo;
  placa: string;
  itens: ItemOrcamento[];
  fotos: FotoOrcamento[];
  totalNum: number;
  formato: 'PDF' | 'Imagem';
  fotosCheias: boolean;
  enviado: boolean;
  onToggleFormato: () => void;
  onToggleFotosCheias: () => void;
  onSalvar: () => void;
  onEnviado: () => void;
}

function dataHoraAgora(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} · ${hh}:${min}`;
}

export default function PreviewScreen({
  oficina,
  numero,
  cliente,
  fone,
  veiculo,
  placa,
  itens,
  fotos,
  totalNum,
  formato,
  fotosCheias,
  enviado,
  onToggleFormato,
  onToggleFotosCheias,
  onSalvar,
  onEnviado,
}: PreviewScreenProps) {
  const docRef = useRef<HTMLDivElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [arquivoBaixavel, setArquivoBaixavel] = useState<{ url: string; nome: string } | null>(null);
  const dataHora = useMemo(() => dataHoraAgora(), []);

  async function gerarArquivoPrincipal(): Promise<{ blob: Blob; nome: string; mime: string }> {
    if (formato === 'PDF') {
      const blob = await gerarPdfOrcamento(
        {
          numero,
          placa,
          veiculoModelo: veiculo.modelo,
          veiculo,
          cliente,
          fone,
          itens,
          fotos,
          total: totalNum,
          condicoes: oficina.condicoes,
          status: 'Enviado',
          criadoEm: Date.now(),
          formato,
          fotosCheias,
        },
        oficina
      );
      return { blob, nome: `orcamento-${numero}.pdf`, mime: 'application/pdf' };
    }
    const dataUrl = await gerarPngDoDocumento(docRef.current!);
    return { blob: dataUrlParaBlob(dataUrl), nome: `orcamento-${numero}.png`, mime: 'image/png' };
  }

  async function enviarWhatsapp() {
    setEnviando(true);
    try {
      onSalvar();
      const principal = await gerarArquivoPrincipal();
      baixarArquivo(principal.blob, principal.nome);
      if (fotosCheias) {
        fotos.forEach((f, i) => {
          baixarArquivo(dataUrlParaBlob(f.dataUrl), `foto-${i + 1}.jpg`);
        });
      }
      setArquivoBaixavel({ url: URL.createObjectURL(principal.blob), nome: principal.nome });
      const artigo = formato === 'PDF' ? 'o' : 'a';
      const texto = `Olá${cliente ? ' ' + cliente : ''}! Segue o orçamento nº ${numero} da ${oficina.nome} — total ${formatarBRL(
        totalNum
      )}. Já te envio ${artigo} ${formato.toLowerCase()} na próxima mensagem.`;
      window.open(montarLinkWhatsapp(fone, texto), '_blank');
      onEnviado();
    } finally {
      setEnviando(false);
    }
  }

  const resumo = fotosCheias
    ? `${formato} + ${fotos.length} fotos em tamanho cheio para ${fone || 'o cliente'}`
    : `Só o ${formato} (fotos em miniatura) para ${fone || 'o cliente'}`;

  return (
    <div className="tela">
      <div className="doc" ref={docRef}>
        <div className="doc__header">
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div className="doc__logo" />
            <div>
              <div className="doc__oficina-nome">{oficina.nome}</div>
              <div className="doc__oficina-info">
                {oficina.endereco} · {oficina.fone}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="doc__numero">Nº {numero}</div>
            <div className="doc__data">{dataHora}</div>
          </div>
        </div>

        <div className="doc__id-faixa">
          <div>
            <div className="doc__id-label">Cliente</div>
            <div className="doc__id-valor">{cliente || 'Cliente balcão'}</div>
          </div>
          <div>
            <div className="doc__id-label">Veículo</div>
            <div className="doc__id-valor">
              {veiculo.modelo || 'Veículo'} · {placa.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="doc__itens">
          {itens.map((it) => (
            <div className="doc__item" key={it.id}>
              <div className="doc__item-nome">{it.nome}</div>
              <div className="doc__item-valor">{formatarBRL(Number(it.valor.replace(',', '.')) || 0)}</div>
            </div>
          ))}
          <div className="doc__total-row">
            <div className="doc__total-label">Total</div>
            <div className="doc__total-valor">{formatarBRL(totalNum)}</div>
          </div>
          <div className="doc__condicoes">{oficina.condicoes}</div>
        </div>

        {fotos.length > 0 && (
          <div className="doc__fotos">
            {fotos.map((f) => (
              <div className="doc__foto" key={f.id}>
                <img src={f.dataUrl} alt="" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="preview-controles">
        <button type="button" className="preview-btn-toggle" onClick={onToggleFormato}>
          Formato: {formato}
        </button>
        <button type="button" className="preview-btn-toggle" onClick={onSalvar}>
          Salvar 90 dias
        </button>
      </div>

      <div className="preview-opcoes">
        <div className="preview-opcao">
          <span className="material-symbols-rounded preview-opcao__icone">picture_as_pdf</span>
          <div style={{ flex: 1 }}>
            <div className="preview-opcao__titulo">{formato} do orçamento</div>
            <div className="preview-opcao__sub">Com as {fotos.length} fotos em miniatura</div>
          </div>
          <span className="material-symbols-rounded" style={{ color: 'var(--verde)', fontSize: 20 }}>
            check_circle
          </span>
        </div>
        <button type="button" className="preview-opcao" onClick={onToggleFotosCheias} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
          <span className="material-symbols-rounded preview-opcao__icone">photo_library</span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div className="preview-opcao__titulo">Fotos em tamanho cheio</div>
            <div className="preview-opcao__sub">Depois do {formato}, para o cliente ampliar</div>
          </div>
          <div
            className="toggle"
            style={{
              background: fotosCheias ? 'var(--verde)' : '#ccd4dd',
              justifyContent: fotosCheias ? 'flex-end' : 'flex-start',
            }}
          >
            <div className="toggle__knob" />
          </div>
        </button>
      </div>

      <button type="button" className="btn-enviar" onClick={enviarWhatsapp} disabled={enviando}>
        <span className="material-symbols-rounded" style={{ fontSize: 21 }}>
          {enviado ? 'check_circle' : 'send'}
        </span>
        {enviando ? 'Preparando…' : enviado ? 'Conversa aberta' : 'Abrir conversa no WhatsApp'}
      </button>

      <div className="resumo-envio">{resumo}</div>

      {enviado && (
        <div className="aviso-enviado">
          <span className="material-symbols-rounded aviso-enviado__icone">touch_app</span>
          <div className="aviso-enviado__texto">
            <div style={{ marginBottom: 6 }}>
              O texto já foi enviado — o WhatsApp <strong>não deixa anexar arquivo automaticamente</strong>, falta só isso:
            </div>
            <div style={{ marginBottom: 3 }}>
              1. Volte pra conversa que abriu com {fone ? fone : 'o cliente'}
            </div>
            <div style={{ marginBottom: 3 }}>
              2. Toque no clipe (📎) → Documento (ou Galeria)
            </div>
            <div style={{ marginBottom: 3 }}>
              3. Escolha o{fotosCheias && fotos.length > 0 ? 's' : ''} arquivo{fotosCheias && fotos.length > 0 ? 's' : ''} que acabou de baixar
              {fotosCheias && fotos.length > 0 ? ` (${formato.toLowerCase()} + ${fotos.length} foto${fotos.length > 1 ? 's' : ''})` : ` (${formato.toLowerCase()})`} e envie
            </div>
            {arquivoBaixavel && (
              <div style={{ marginTop: 6 }}>
                Não achou o arquivo?{' '}
                <a href={arquivoBaixavel.url} download={arquivoBaixavel.nome} style={{ color: 'inherit', fontWeight: 700 }}>
                  baixar {formato.toLowerCase()} de novo
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
