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
  const blob = new Blob([vcard], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nome.trim()}.vcf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
