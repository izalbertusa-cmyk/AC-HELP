import { useState } from 'react';
import type { FonteVeiculo, Veiculo } from '../types';

interface CheckinScreenProps {
  placa: string;
  placaManual: string;
  veiculo: Veiculo;
  fonte: FonteVeiculo;
  manual: boolean;
  cliente: string;
  fone: string;
  queixas: string[];
  queixasSel: string[];
  onPlacaChange: (v: string) => void;
  onBuscar: () => void;
  onPreencherManual: () => void;
  onPlacaManualChange: (v: string) => void;
  onVeiculoChange: (v: Veiculo) => void;
  onSalvarVeiculo: () => void;
  onClienteChange: (v: string) => void;
  onFoneChange: (v: string) => void;
  onToggleQueixa: (nome: string) => void;
  onSalvarNovoTopico: (nome: string) => void;
  onContinuar: () => void;
}

const DICAS: Record<FonteVeiculo, string> = {
  api: 'Dados vindos da consulta de placa.',
  local: 'Veículo já cadastrado nesta oficina.',
  falha: 'Puxa modelo, ano e motor pela placa.',
  manual: 'Puxa modelo, ano e motor pela placa.',
  nenhum: 'Puxa modelo, ano e motor pela placa.',
};

export default function CheckinScreen({
  placa,
  placaManual,
  veiculo,
  fonte,
  manual,
  cliente,
  fone,
  queixas,
  queixasSel,
  onPlacaChange,
  onBuscar,
  onPreencherManual,
  onPlacaManualChange,
  onVeiculoChange,
  onSalvarVeiculo,
  onClienteChange,
  onFoneChange,
  onToggleQueixa,
  onSalvarNovoTopico,
  onContinuar,
}: CheckinScreenProps) {
  const [novoTopicoAberto, setNovoTopicoAberto] = useState(false);
  const [novoTopico, setNovoTopico] = useState('');

  const falhouBusca = fonte === 'falha' || (manual && fonte !== 'api' && fonte !== 'local');
  const tituloFalha = fonte === 'falha' ? 'Placa não encontrada ou sem internet' : 'Preenchimento manual';
  const veiculoOk = !manual && !!veiculo.modelo;
  const semVeiculo = !manual && !veiculo.modelo;
  const fonteDado =
    fonte === 'api' ? 'consulta online' : fonte === 'local' ? 'salvo na oficina' : manual ? 'preenchendo' : 'não consultado';
  const fonteDestacada = fonte === 'falha' || manual;
  const placaTopo = manual ? (placaManual.toUpperCase() || 'SEM PLACA') : placa.toUpperCase();

  function confirmarNovoTopico() {
    const n = novoTopico.trim();
    if (n) onSalvarNovoTopico(n);
    setNovoTopico('');
    setNovoTopicoAberto(false);
  }

  return (
    <div className="tela tela--checkin">
      <div className="card">
        <div className="card-label">Buscar pela placa</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <input
            value={placa}
            onChange={(e) => onPlacaChange(e.target.value)}
            placeholder="ABC1D23"
            maxLength={7}
            style={{
              flex: 1,
              minWidth: 0,
              font: "700 26px/1 'Barlow Condensed'",
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              textAlign: 'center',
              padding: '14px 8px',
              border: '2px dashed var(--borda-tracejada)',
              borderRadius: 12,
              background: 'var(--fundo-campo)',
              color: 'var(--azul)',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={onBuscar}
            style={{
              flex: 'none',
              width: 96,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              background: 'var(--laranja)',
              color: '#fff',
              font: '700 14px/1 Barlow',
              border: 'none',
            }}
          >
            Buscar
          </button>
        </div>
        <div style={{ font: '400 12px/1.4 Barlow', color: 'var(--texto-secundario)', marginTop: 9 }}>
          {DICAS[fonte]}
        </div>
      </div>

      <button type="button" className="link-laranja" style={{ marginBottom: 8 }} onClick={onPreencherManual}>
        <span className="material-symbols-rounded" style={{ fontSize: 17 }}>
          edit_note
        </span>
        Preencher manualmente
      </button>

      {falhouBusca && (
        <div className="aviso-alerta">
          <span className="material-symbols-rounded aviso-alerta__icone">wifi_off</span>
          <div>
            <div className="aviso-alerta__titulo">{tituloFalha}</div>
            <div className="aviso-alerta__corpo">
              Preenche abaixo. Fica salvo nessa placa — na próxima visita já vem pronto, mesmo offline.
            </div>
          </div>
        </div>
      )}

      <div className="cartao-veiculo">
        {!manual && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                font: "700 24px/1 'Barlow Condensed'",
                letterSpacing: '.16em',
              }}
            >
              {placaTopo}
            </div>
            <div
              style={{
                font: '600 11px/1 Barlow',
                padding: '6px 9px',
                borderRadius: 8,
                background: fonteDestacada ? 'rgba(245,134,52,.25)' : 'rgba(255,255,255,.12)',
                color: fonteDestacada ? 'var(--laranja-claro)' : '#fff',
              }}
            >
              {fonteDado}
            </div>
          </div>
        )}
        {veiculoOk && (
          <>
            <div style={{ font: '600 17px/1.2 Barlow', marginTop: 10 }}>{veiculo.modelo}</div>
            <div style={{ display: 'flex', gap: 18, marginTop: 10, font: '400 12.5px/1 Barlow', opacity: 0.7 }}>
              <span>Ano {veiculo.ano}</span>
              <span>{veiculo.motor}</span>
              <span>Gás {veiculo.gas}</span>
            </div>
          </>
        )}
        {semVeiculo && (
          <div style={{ font: '400 13.5px/1.4 Barlow', marginTop: 12, color: 'rgba(255,255,255,.55)' }}>
            Toque em Buscar para carregar os dados do veículo.
          </div>
        )}
        {manual && (
          <>
            <input
              value={placaManual}
              onChange={(e) => onPlacaManualChange(e.target.value.toUpperCase().slice(0, 7))}
              placeholder="PLACA"
              maxLength={7}
              className="input-azul"
              style={{
                marginTop: 12,
                font: "700 20px/1 'Barlow Condensed'",
                letterSpacing: '.16em',
                textTransform: 'uppercase',
              }}
            />
            <input
              value={veiculo.modelo}
              onChange={(e) => onVeiculoChange({ ...veiculo, modelo: e.target.value })}
              placeholder="Marca e modelo"
              className="input-azul"
              style={{ marginTop: 8, font: '600 15.5px/1 Barlow' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                value={veiculo.ano}
                onChange={(e) => onVeiculoChange({ ...veiculo, ano: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) })}
                inputMode="numeric"
                placeholder="Ano"
                className="input-azul"
                style={{ width: 82, flex: 'none' }}
              />
              <input
                value={veiculo.motor}
                onChange={(e) => onVeiculoChange({ ...veiculo, motor: e.target.value })}
                placeholder="Motor (opcional)"
                className="input-azul"
                style={{ flex: 1, minWidth: 0 }}
              />
            </div>
            <div className="gas-selector">
              <span className="gas-label">Gás</span>
              {(['R134a', 'R1234yf'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`gas-chip${veiculo.gas === g ? ' gas-chip--sel' : ''}`}
                  onClick={() => onVeiculoChange({ ...veiculo, gas: g })}
                >
                  {g}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onSalvarVeiculo}
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 11,
                background: 'rgba(255,255,255,.12)',
                textAlign: 'center',
                font: '700 13.5px/1 Barlow',
                color: '#fff',
                border: 'none',
                width: '100%',
              }}
            >
              Salvar no cadastro da placa
            </button>
          </>
        )}
      </div>

      <div className="card" style={{ marginTop: 16, marginBottom: 0 }}>
        <div className="card-label" style={{ marginBottom: 10 }}>
          Cliente
        </div>
        <input
          value={cliente}
          onChange={(e) => onClienteChange(e.target.value)}
          placeholder="Nome do cliente"
          className="field"
        />
        <input
          value={fone}
          onChange={(e) => onFoneChange(e.target.value)}
          placeholder="WhatsApp (11) 9 0000-0000"
          className="field"
          style={{ marginTop: 9 }}
        />
      </div>

      <div className="card" style={{ marginTop: 16, marginBottom: 0 }}>
        <div className="card-label" style={{ marginBottom: 4 }}>
          Relato do cliente
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {queixas.map((q) => {
            const on = queixasSel.includes(q);
            return (
              <button
                key={q}
                type="button"
                className={`chip${on ? ' chip--selecionado' : ''}`}
                onClick={() => onToggleQueixa(q)}
              >
                {q}
              </button>
            );
          })}
          <button
            type="button"
            className="chip chip--tracejado"
            onClick={() => setNovoTopicoAberto((v) => !v)}
          >
            + Novo tópico
          </button>
        </div>
        {novoTopicoAberto && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              autoFocus
              value={novoTopico}
              onChange={(e) => setNovoTopico(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmarNovoTopico();
              }}
              placeholder="Ex.: pisca a luz do painel"
              className="field"
              style={{ flex: 1, minWidth: 0 }}
            />
            <button
              type="button"
              onClick={confirmarNovoTopico}
              style={{
                flex: 'none',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 10,
                background: 'var(--laranja)',
                color: '#fff',
                font: '700 13px/1 Barlow',
                border: 'none',
              }}
            >
              Add
            </button>
          </div>
        )}
      </div>

      <button type="button" className="btn-primary" style={{ marginTop: 18 }} onClick={onContinuar}>
        Montar orçamento
      </button>
    </div>
  );
}
