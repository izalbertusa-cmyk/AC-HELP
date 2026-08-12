import { useMemo, useRef, useState } from 'react';
import type { FotoOrcamento, ItemOrcamento, OficinaDados, Veiculo } from '../types';
import { formatarBRL } from '../utils/money';
import { gerarPdfOrcamento } from '../utils/pdf';
import { gerarPngDoDocumento, dataUrlParaBlob } from '../utils/documento';
import { baixarArquivo } from '../utils/whatsapp';
import { suportaCompartilharArquivos, compartilharArquivos } from '../utils/compartilhar';

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
  const [semSuporte, setSemSuporte] = useState(false);
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
    setSemSuporte(false);
    try {
      onSalvar();
      const principal = await gerarArquivoPrincipal();
      const arquivos = [{ blob: principal.blob, nome: principal.nome }];
      if (fotosCheias) {
        fotos.forEach((f, i) => {
          arquivos.push({ blob: dataUrlParaBlob(f.dataUrl), nome: `foto-${i + 1}.jpg` });
        });
      }
      const arquivosFile = arquivos.map((a) => new File([a.blob], a.nome, { type: a.blob.type }));
      if (!suportaCompartilharArquivos(arquivosFile)) {
        setSemSuporte(true);
        setArquivoBaixavel({ url: URL.createObjectURL(principal.blob), nome: principal.nome });
        baixarArquivo(principal.blob, principal.nome);
        return;
      }
      const resultado = await compartilharArquivos(
        arquivos,
        `Orçamento ${numero} — total ${formatarBRL(totalNum)}`,
        `Orçamento ${numero} — ${oficina.nome}`
      );
      if (resultado === 'ok') {
        onEnviado();
      } else if (resultado === 'sem-suporte') {
        setSemSuporte(true);
        setArquivoBaixavel({ url: URL.createObjectURL(principal.blob), nome: principal.nome });
        baixarArquivo(principal.blob, principal.nome);
      }
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
        {enviando ? 'Preparando…' : enviado ? 'Aberto no WhatsApp' : 'Enviar no WhatsApp'}
      </button>

      <div className="resumo-envio">{resumo}</div>

      {semSuporte && (
        <div className="aviso-alerta" style={{ marginTop: 12 }}>
          <span className="material-symbols-rounded aviso-alerta__icone">wifi_off</span>
          <div>
            <div className="aviso-alerta__titulo">Compartilhamento não suportado</div>
            <div className="aviso-alerta__corpo">
              Este navegador não permite anexar arquivo direto no compartilhamento — o {formato.toLowerCase()} já foi baixado.
              {arquivoBaixavel && (
                <>
                  {' '}
                  <a href={arquivoBaixavel.url} download={arquivoBaixavel.nome} style={{ color: 'var(--alerta-icone)', fontWeight: 700 }}>
                    Baixar de novo
                  </a>
                </>
              )}{' '}
              e anexe manualmente na conversa com {fone || 'o cliente'}.
            </div>
          </div>
        </div>
      )}

      {enviado && (
        <div className="aviso-enviado">
          <span className="material-symbols-rounded aviso-enviado__icone">touch_app</span>
          <div className="aviso-enviado__texto">
            O menu de compartilhamento abriu com {fotosCheias ? fotos.length + 1 : 1} anexo{(fotosCheias ? fotos.length + 1 : 1) > 1 ? 's' : ''} pronto{(fotosCheias ? fotos.length + 1 : 1) > 1 ? 's' : ''}.{' '}
            <strong>Escolha o WhatsApp e o contato de {fone || 'o cliente'}</strong> para concluir o envio.
          </div>
        </div>
      )}
    </div>
  );
}
