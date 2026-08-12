export type Gas = 'R134a' | 'R1234yf';

export interface Veiculo {
  modelo: string;
  ano: string;
  motor: string;
  gas: Gas;
}

export type FonteVeiculo = 'api' | 'local' | 'falha' | 'manual' | 'nenhum';

export interface CatalogoItem {
  id: string;
  nome: string;
  valor: string;
}

export interface ItemOrcamento {
  id: string;
  nome: string;
  tipo: 'Peça' | 'Mão de obra';
  valor: string;
}

export interface FotoOrcamento {
  id: string;
  dataUrl: string;
}

export type StatusOrcamento = 'Enviado' | 'Aprovado' | 'Sem resposta';

export interface OrcamentoSalvo {
  id?: number;
  numero: string;
  placa: string;
  veiculoModelo: string;
  veiculo: Veiculo;
  cliente: string;
  fone: string;
  itens: ItemOrcamento[];
  fotos: FotoOrcamento[];
  total: number;
  condicoes: string;
  status: StatusOrcamento;
  criadoEm: number;
  formato: 'PDF' | 'Imagem';
  fotosCheias: boolean;
}

export interface OficinaDados {
  id?: number;
  nome: string;
  endereco: string;
  fone: string;
  condicoes: string;
}

export interface VeiculoLocal {
  placa: string;
  veiculo: Veiculo;
}

export interface CatalogoDB {
  id?: string;
  aba: AbaCatalogo;
  nome: string;
  valor: string;
  ordem: number;
}

export interface TopicoRelato {
  id?: number;
  nome: string;
}

export type Tela = 'checkin' | 'orcamento' | 'ajustes' | 'historico' | 'preview';

export type AbaCatalogo = 'pecas' | 'servico';
