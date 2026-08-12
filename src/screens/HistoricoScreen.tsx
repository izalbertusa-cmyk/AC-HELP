import type { OrcamentoSalvo } from '../types';
import { formatarBRL } from '../utils/money';
import { combina } from '../utils/text';

interface HistoricoScreenProps {
  orcamentos: OrcamentoSalvo[];
  busca: string;
  onBuscaChange: (v: string) => void;
  onAbrir: (id: number) => void;
}

const STATUS_COR: Record<string, string> = {
  Aprovado: 'var(--verde)',
  Enviado: 'var(--texto-secundario)',
  'Sem resposta': 'var(--alerta-icone)',
};

function formatarData(ts: number): string {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export default function HistoricoScreen({ orcamentos, busca, onBuscaChange, onAbrir }: HistoricoScreenProps) {
  const filtrados = orcamentos.filter((o) => combina(busca, o.placa, o.cliente, o.veiculoModelo));

  return (
    <div className="tela">
      <div className="busca-hist">
        <span className="material-symbols-rounded" style={{ fontSize: 20, color: 'var(--texto-terciario)' }}>
          search
        </span>
        <input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Buscar por placa, cliente ou veículo"
        />
        {busca && (
          <button
            type="button"
            onClick={() => onBuscaChange('')}
            aria-label="Limpar busca"
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              background: 'var(--fundo-tela)',
              color: 'var(--texto-secundario)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 'none',
              border: 'none',
            }}
          >
            ×
          </button>
        )}
      </div>

      <div className="hist-header">
        <div className="hist-header__titulo">Histórico</div>
        <div className="hist-header__nota">guardados por 90 dias</div>
      </div>

      {filtrados.length === 0 && (
        <div className="vazio">Nenhum orçamento para "{busca}".</div>
      )}

      {filtrados.map((o) => (
        <button key={o.id} type="button" className="hist-row" onClick={() => onAbrir(o.id!)}>
          <div className="hist-row__placa">{o.placa.toUpperCase().slice(0, 3)}</div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div className="hist-row__veiculo">{o.veiculoModelo || o.veiculo.modelo || 'Veículo'}</div>
            <div className="hist-row__sub">
              {o.cliente || 'Cliente balcão'} · {formatarData(o.criadoEm)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="hist-row__total">{formatarBRL(o.total)}</div>
            <div className="hist-row__status" style={{ color: STATUS_COR[o.status] }}>
              {o.status}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
