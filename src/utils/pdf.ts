import { jsPDF } from 'jspdf';
import type { OficinaDados, OrcamentoSalvo } from './../types';
import { formatarBRL, parseValor } from './money';

function dataHoraAgora(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} · ${hh}:${min}`;
}

export async function gerarPdfOrcamento(
  orcamento: Omit<OrcamentoSalvo, 'id'>,
  oficina: OficinaDados
): Promise<Blob> {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const margem = 16;
  const largura = 210 - margem * 2;
  let y = margem;

  pdf.setFillColor(27, 63, 105);
  pdf.rect(0, 0, 210, 36, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(oficina.nome.toUpperCase(), margem, 16);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.text(`${oficina.endereco} · ${oficina.fone}`, margem, 23);

  pdf.setFontSize(9.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Nº ${orcamento.numero}`, 210 - margem, 16, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.text(dataHoraAgora(), 210 - margem, 23, { align: 'right' });

  y = 46;
  pdf.setTextColor(27, 63, 105);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text(orcamento.cliente || 'Cliente balcão', margem, y);
  pdf.text(`${orcamento.veiculo.modelo || 'Veículo'} · ${orcamento.placa.toUpperCase()}`, 210 - margem, y, {
    align: 'right',
  });

  y += 8;
  pdf.setDrawColor(221, 227, 234);
  pdf.line(margem, y, 210 - margem, y);
  y += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10.5);
  orcamento.itens.forEach((it) => {
    if (y > 260) {
      pdf.addPage();
      y = margem;
    }
    pdf.setTextColor(51, 64, 79);
    pdf.text(it.nome, margem, y);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(27, 63, 105);
    pdf.text(formatarBRL(parseValor(it.valor)), 210 - margem, y, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    y += 4;
    pdf.setDrawColor(237, 241, 245);
    pdf.line(margem, y, 210 - margem, y);
    y += 5;
  });

  y += 4;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(123, 135, 148);
  pdf.text('TOTAL', margem, y);
  pdf.setFontSize(18);
  pdf.setTextColor(27, 63, 105);
  pdf.text(formatarBRL(orcamento.total), 210 - margem, y, { align: 'right' });

  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(123, 135, 148);
  const condicoesLinhas = pdf.splitTextToSize(orcamento.condicoes, largura);
  pdf.text(condicoesLinhas, margem, y);
  y += condicoesLinhas.length * 4.5 + 6;

  if (orcamento.fotos.length > 0) {
    const cols = 3;
    const gap = 4;
    const tileW = (largura - gap * (cols - 1)) / cols;
    const tileH = tileW * 0.75;
    for (let i = 0; i < orcamento.fotos.length; i++) {
      if (y + tileH > 280) {
        pdf.addPage();
        y = margem;
      }
      const col = i % cols;
      const x = margem + col * (tileW + gap);
      try {
        pdf.addImage(orcamento.fotos[i].dataUrl, 'JPEG', x, y, tileW, tileH, undefined, 'FAST');
      } catch {
        // ignora foto inválida
      }
      if (col === cols - 1 || i === orcamento.fotos.length - 1) {
        y += tileH + gap;
      }
    }
  }

  return pdf.output('blob');
}
