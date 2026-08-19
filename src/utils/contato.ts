export function digitosTelefone(fone: string): string {
  return (fone || '').replace(/\D/g, '');
}

function telefoneE164(fone: string): string {
  let digitos = digitosTelefone(fone);
  if (digitos.length === 10 || digitos.length === 11) digitos = '55' + digitos;
  return digitos ? `+${digitos}` : '';
}

export function baixarContatoVcf(nome: string, fone: string): void {
  const telefone = telefoneE164(fone);
  if (!nome.trim() || !telefone) return;
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${nome.trim()}`,
    `TEL;TYPE=CELL:${telefone}`,
    'END:VCARD',
  ].join('\r\n');
  const blob = new Blob([vcard], { type: 'text/x-vcard' });
  const url = URL.createObjectURL(blob);
  // Sem o atributo "download": abrir o blob numa aba nova faz o Android reconhecer
  // o tipo text/x-vcard e oferecer abrir com o app de Contatos, em vez de só
  // salvar o arquivo silenciosamente na pasta Downloads. window.open (em vez de
  // location.href) evita destruir o estado do app na aba atual.
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
