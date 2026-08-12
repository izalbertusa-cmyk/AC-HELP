import type { Tela } from '../types';

interface Aba {
  tela: Tela;
  nome: string;
  icone: string;
}

const ABAS: Aba[] = [
  { tela: 'checkin', nome: 'Check-in', icone: 'directions_car' },
  { tela: 'orcamento', nome: 'Orçamento', icone: 'calculate' },
  { tela: 'ajustes', nome: 'Ajustes', icone: 'settings' },
  { tela: 'historico', nome: 'Histórico', icone: 'description' },
];

interface TabBarProps {
  telaAtual: Tela;
  onIr: (tela: Tela) => void;
}

export default function TabBar({ telaAtual, onIr }: TabBarProps) {
  return (
    <nav className="tabbar">
      {ABAS.map((a) => {
        const ativo = telaAtual === a.tela;
        return (
          <button
            key={a.tela}
            type="button"
            className="tabbar__item"
            onClick={() => onIr(a.tela)}
            style={{ color: ativo ? '#f58634' : '#9aa5b1' }}
          >
            <span
              className={`material-symbols-rounded tabbar__icon${ativo ? ' icon-fill' : ''}`}
              style={{ opacity: ativo ? 1 : 0.75 }}
            >
              {a.icone}
            </span>
            <div className="tabbar__label">{a.nome}</div>
          </button>
        );
      })}
    </nav>
  );
}
