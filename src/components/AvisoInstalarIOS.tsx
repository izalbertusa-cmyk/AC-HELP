import { useEffect, useState } from 'react';
import { ehIOS, ehStandalone } from '../utils/plataforma';

const CHAVE_DISPENSADO = 'ac-help-aviso-ios-dispensado';

export default function AvisoInstalarIOS() {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    if (ehIOS() && !ehStandalone() && !sessionStorage.getItem(CHAVE_DISPENSADO)) {
      setMostrar(true);
    }
  }, []);

  if (!mostrar) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        background: '#1b3f69',
        color: '#fff',
        padding: '14px 16px 18px',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        boxShadow: '0 -8px 24px rgba(0,0,0,.25)',
      }}
    >
      <span className="material-symbols-rounded" style={{ fontSize: 22, color: '#ffb071', flex: 'none' }}>
        ios_share
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ font: '700 13.5px/1.3 Barlow' }}>Instale o app antes de usar</div>
        <div style={{ font: '400 12.5px/1.4 Barlow', opacity: 0.85, marginTop: 4 }}>
          No iPhone, se o app não for instalado, o Safari apaga seus dados salvos (catálogo, clientes,
          orçamentos) depois de alguns dias sem uso. Toque no botão de compartilhar do Safari (⬆️) e escolha{' '}
          <strong>"Adicionar à Tela de Início"</strong>.
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem(CHAVE_DISPENSADO, '1');
          setMostrar(false);
        }}
        style={{
          flex: 'none',
          background: 'rgba(255,255,255,.15)',
          border: 'none',
          color: '#fff',
          borderRadius: 8,
          width: 26,
          height: 26,
          font: '700 14px/1 Barlow',
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  );
}
