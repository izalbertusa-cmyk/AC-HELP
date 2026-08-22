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

  const dispensar = () => {
    sessionStorage.setItem(CHAVE_DISPENSADO, '1');
    setMostrar(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(14,26,43,.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 18,
          padding: '26px 22px 22px',
          maxWidth: 340,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,.4)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: '#fff3e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 30, color: '#f58634' }}>
            add_box
          </span>
        </div>
        <div style={{ font: '700 18px/1.3 Barlow', color: '#1b3f69' }}>Instale o app antes de usar</div>
        <div style={{ font: '400 13.5px/1.5 Barlow', color: '#566270', marginTop: 10 }}>
          No iPhone, se o app não for instalado, o Safari apaga seus dados salvos (catálogo, clientes,
          orçamentos) depois de alguns dias sem uso.
        </div>
        <div style={{ textAlign: 'left', marginTop: 16, background: '#f7f9fb', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ font: '600 12px/1.5 Barlow', color: '#1b3f69', marginBottom: 6 }}>Como instalar:</div>
          <div style={{ font: '400 13px/1.5 Barlow', color: '#33404f' }}>
            1. Toque no ícone de <strong>compartilhar</strong> do Safari — se não aparecer direto, toque em{' '}
            <strong>"•••" (mais opções)</strong> na barra de baixo
            <br />
            2. Procure <strong>"Adicionar à Tela de Início"</strong>
            <br />
            3. Toque em <strong>"Adicionar"</strong>
          </div>
        </div>
        <button
          type="button"
          onClick={dispensar}
          style={{
            width: '100%',
            marginTop: 18,
            padding: '13px',
            borderRadius: 12,
            border: 'none',
            background: '#f58634',
            color: '#fff',
            font: '700 14px/1 Barlow',
            cursor: 'pointer',
          }}
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
