import { useMemo, useRef, useState } from 'react';
import type { FotoOrcamento, ItemOrcamento, OficinaDados, Veiculo } from '../types';
import { formatarBRL } from '../utils/money';
import { gerarPdfOrcamento } from '../utils/pdf';
import { gerarPngDoDocumento, dataUrlParaBlob } from '../utils/documento';
import { baixarArquivo, montarLinkWhatsapp } from '../utils/whatsapp';
import { enviarParaR2 } from '../utils/upload';
import { suportaCompartilharArquivos, compartilharArquivos } from '../utils/compartilhar';
import { ehIOS } from '../utils/plataforma';

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
  onSalvar,
  onEnviado,
}: PreviewScreenProps) {
  const docRef = useRef<HTMLDivElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [semSuporte, setSemSuporte] = useState(false);
  const [metodoEnvio, setMetodoEnvio] = useState<'anexo' | 'link' | null>(null);
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

  async function enviarPorLink(principal: { blob: Blob; nome: string }) {
    try {
      const linkPublico = await enviarParaR2(principal.blob);
      const artigo = formato === 'PDF' ? 'o' : 'a';
      const texto = `Olá${cliente ? ' ' + cliente : ''}! Segue ${artigo} ${formato.toLowerCase()} do orçamento nº ${numero} da ${oficina.nome} — total ${formatarBRL(
        totalNum
      )}:\n${linkPublico}`;
      window.open(montarLinkWhatsapp(fone, texto), '_blank');
      setMetodoEnvio('link');
      onEnviado();
    } catch {
      // sem internet, ou upload falhou: baixa local, mecânico anexa manualmente
      setSemSuporte(true);
      setArquivoBaixavel({ url: URL.createObjectURL(principal.blob), nome: principal.nome });
      baixarArquivo(principal.blob, principal.nome);
      const artigo = formato === 'PDF' ? 'o' : 'a';
      const texto = `Olá${cliente ? ' ' + cliente : ''}! Segue ${artigo} ${formato.toLowerCase()} do orçamento nº ${numero} da ${oficina.nome} — total ${formatarBRL(
        totalNum
      )}. Já te envio na próxima mensagem.`;
      window.open(montarLinkWhatsapp(fone, texto), '_blank');
    }
  }

  async function enviarWhatsapp() {
    setEnviando(true);
    setSemSuporte(false);
    try {
      onSalvar();
      const principal = await gerarArquivoPrincipal();
      // No iOS o WhatsApp tem um bug conhecido (afeta até apps nativos) que trava o
      // recebimento de arquivo vindo de compartilhamento externo — então pulamos
      // direto pro link, que é o caminho confiável nesse aparelho.
      if (ehIOS()) {
        await enviarPorLink(principal);
        return;
      }
      // Fora do iOS, prioriza anexar o PDF/imagem de verdade (fica com cara de
      // documento real no WhatsApp, igual concorrência) — só cai pro link se o
      // navegador não suportar compartilhar arquivo.
      const arquivoFile = new File([principal.blob], principal.nome, { type: principal.blob.type });
      if (!suportaCompartilharArquivos([arquivoFile])) {
        await enviarPorLink(principal);
        return;
      }
      const resultado = await compartilharArquivos([{ blob: principal.blob, nome: principal.nome }]);
      if (resultado === 'ok') {
        setMetodoEnvio('anexo');
        onEnviado();
      } else if (resultado === 'sem-suporte') {
        await enviarPorLink(principal);
      }
      // 'erro' geralmente é o mecânico cancelando o menu de compartilhar — não faz nada.
    } finally {
      setEnviando(false);
    }
  }

  const resumo = `${formato} (com fotos em miniatura) para ${fone || 'o cliente'}`;

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
      </div>

      <button type="button" className="btn-enviar" onClick={enviarWhatsapp} disabled={enviando}>
        <span className="material-symbols-rounded" style={{ fontSize: 21 }}>
          {enviado ? 'check_circle' : 'send'}
        </span>
        {enviando ? 'Preparando…' : enviado ? 'Aberto no WhatsApp' : 'Enviar no WhatsApp'}
      </button>

      <button
        type="button"
        onClick={async () => {
          setEnviando(true);
          setSemSuporte(false);
          setMetodoEnvio('link');
          try {
            onSalvar();
            const principal = await gerarArquivoPrincipal();
            await enviarPorLink(principal);
          } finally {
            setEnviando(false);
          }
        }}
        disabled={enviando}
        style={{
          marginTop: 8,
          width: '100%',
          padding: '10px',
          border: 'none',
          background: 'none',
          color: 'var(--laranja)',
          font: '700 12.5px/1 Barlow',
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        Cliente novo, ainda não salvo? Enviar por link
      </button>

      <div className="resumo-envio">{resumo}</div>

      {semSuporte && (
        <div className="aviso-alerta" style={{ marginTop: 12 }}>
          <span className="material-symbols-rounded aviso-alerta__icone">wifi_off</span>
          <div>
            <div className="aviso-alerta__titulo">Sem conexão com o servidor</div>
            <div className="aviso-alerta__corpo">
              Não deu pra gerar o link do orçamento agora (sem internet?) — o {formato.toLowerCase()} já foi baixado.
              {arquivoBaixavel && (
                <>
                  {' '}
                  <a href={arquivoBaixavel.url} download={arquivoBaixavel.nome} style={{ color: 'var(--alerta-icone)', fontWeight: 700 }}>
                    Baixar de novo
                  </a>
                </>
              )}{' '}
              A conversa com {fone || 'o cliente'} abriu — anexe manualmente o arquivo baixado.
            </div>
          </div>
        </div>
      )}

      {enviado && !semSuporte && metodoEnvio === 'anexo' && (
        <div className="aviso-enviado">
          <span className="material-symbols-rounded aviso-enviado__icone">touch_app</span>
          <div className="aviso-enviado__texto">
            O menu de compartilhamento abriu com o {formato.toLowerCase()} pronto.{' '}
            <strong>Escolha o WhatsApp e o contato de {fone || 'o cliente'}</strong> para concluir o envio.
          </div>
        </div>
      )}

      {enviado && !semSuporte && metodoEnvio === 'link' && (
        <div className="aviso-enviado">
          <span className="material-symbols-rounded aviso-enviado__icone">touch_app</span>
          <div className="aviso-enviado__texto">
            A conversa com {fone || 'o cliente'} abriu com o link do {formato.toLowerCase()} já na mensagem.{' '}
            <strong>Toque em enviar</strong> para concluir.
          </div>
        </div>
      )}
    </div>
  );
}
