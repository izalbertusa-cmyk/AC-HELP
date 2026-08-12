import type { Tela } from '../types';
import logoTexto from '../assets/logo-ac-texto.png';
import logoMark from '../assets/logo-ac-mark.png';

interface HeaderProps {
  tela: Tela;
  kicker: string;
  titulo: string;
  headerTag: string;
  podeVoltar: boolean;
  onVoltar: () => void;
}

export default function Header({
  kicker,
  titulo,
  headerTag,
  podeVoltar,
  onVoltar,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__mark">
          <img src={logoMark} alt="A/C Help" />
        </div>
        <div className="header__chip">
          <img src={logoTexto} alt="A/C Help" />
          <div className="header__tagline">
            <div className="header__tagline-rule" />
            <div className="header__tagline-text">Seu aliado em cada orçamento</div>
            <div className="header__tagline-rule" />
          </div>
        </div>
      </div>
      <div className="header__context">
        <button
          type="button"
          className="header__back"
          onClick={onVoltar}
          disabled={!podeVoltar}
          style={{ visibility: podeVoltar ? 'visible' : 'hidden' }}
          aria-label="Voltar"
        >
          ‹
        </button>
        <div className="header__titles">
          <div className="header__kicker">{kicker}</div>
          <div className="header__titulo">{titulo}</div>
        </div>
        <div className="header__tag">{headerTag}</div>
      </div>
    </header>
  );
}
