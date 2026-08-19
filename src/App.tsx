import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import './App.css';
import { db, garantirSeed } from './db/db';
import Header from './components/Header';
import TabBar from './components/TabBar';
import CheckinScreen from './screens/CheckinScreen';
import OrcamentoScreen from './screens/OrcamentoScreen';
import AjustesScreen from './screens/AjustesScreen';
import HistoricoScreen from './screens/HistoricoScreen';
import PreviewScreen from './screens/PreviewScreen';
import type {
  AbaCatalogo,
  FonteVeiculo,
  FotoOrcamento,
  ItemOrcamento,
  Tela,
  Veiculo,
} from './types';
import { parseValor } from './utils/money';
import { baixarContatoVcf, digitosTelefone } from './utils/contato';

const VEICULO_VAZIO: Veiculo = { modelo: '', ano: '', motor: '', gas: 'R134a' };

const KICKERS: Record<Tela, string> = {
  checkin: '',
  orcamento: 'Etapa 2 de 3',
  preview: 'Etapa 3 de 3',
  ajustes: 'Configuração',
  historico: 'Últimos 90 dias',
};

const TITULOS: Record<Tela, string> = {
  checkin: 'Check-in do veículo',
  orcamento: 'Montar orçamento',
  preview: 'Orçamento pronto',
  ajustes: 'Ajustes da oficina',
  historico: 'Histórico de orçamentos',
};

const VOLTAR_PARA: Partial<Record<Tela, Tela>> = {
  orcamento: 'checkin',
  preview: 'orcamento',
  ajustes: 'checkin',
  historico: 'checkin',
};

export default function App() {
  const [pronto, setPronto] = useState(false);
  const [tela, setTela] = useState<Tela>('checkin');

  const [placa, setPlaca] = useState('');
  const [placaManual, setPlacaManual] = useState('');
  const [veiculo, setVeiculo] = useState<Veiculo>(VEICULO_VAZIO);
  const [fonte, setFonte] = useState<FonteVeiculo>('nenhum');
  const [manual, setManual] = useState(false);

  const [cliente, setCliente] = useState('');
  const [fone, setFone] = useState('');
  const [queixasSel, setQueixasSel] = useState<string[]>([]);

  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [fotos, setFotos] = useState<FotoOrcamento[]>([]);
  const [aba, setAba] = useState<AbaCatalogo>('pecas');
  const [editandoIdCatalogo, setEditandoIdCatalogo] = useState<string | null>(null);
  const [editCatalogoAberto, setEditCatalogoAberto] = useState(false);

  const [formato, setFormato] = useState<'PDF' | 'Imagem'>('PDF');
  const [fotosCheias, setFotosCheias] = useState(true);
  const [enviado, setEnviado] = useState(false);
  const [numeroOrcamento, setNumeroOrcamento] = useState('0001');
  const [orcamentoAtualId, setOrcamentoAtualId] = useState<number | undefined>(undefined);

  const [buscaHist, setBuscaHist] = useState('');

  useEffect(() => {
    garantirSeed().then(() => setPronto(true));
  }, []);

  const oficina = useLiveQuery(() => db.oficina.get(1), []);
  const topicosDb = useLiveQuery(() => db.topicos.toArray(), []);
  const catalogoDb = useLiveQuery(() => db.catalogo.toArray(), []);
  const orcamentosDb = useLiveQuery(
    () => db.orcamentos.orderBy('criadoEm').reverse().toArray(),
    []
  );

  const queixas = useMemo(() => (topicosDb ?? []).map((t) => t.nome), [topicosDb]);

  const fonesConhecidos = useMemo(
    () => new Set((orcamentosDb ?? []).map((o) => digitosTelefone(o.fone))),
    [orcamentosDb]
  );
  const foneDigitos = digitosTelefone(fone);
  const clienteNovo = foneDigitos.length >= 10 && !fonesConhecidos.has(foneDigitos);

  const totalNum = useMemo(
    () => itens.reduce((acc, it) => acc + parseValor(it.valor), 0),
    [itens]
  );

  function irPara(t: Tela) {
    setTela(t);
    setEnviado(false);
  }

  function voltar() {
    irPara(VOLTAR_PARA[tela] ?? 'checkin');
  }

  function onBuscarPlaca() {
    const p = placa.toUpperCase();
    if (!p) return;
    db.veiculosLocais.get(p).then((registro) => {
      if (registro) {
        setVeiculo(registro.veiculo);
        setFonte('local');
        setManual(false);
        setTela('checkin');
      } else {
        setVeiculo(VEICULO_VAZIO);
        setFonte('falha');
        setManual(true);
        setPlacaManual(p);
        setTela('checkin');
      }
    });
  }

  function onPlacaChange(v: string) {
    setPlaca(v.toUpperCase().slice(0, 7));
    setVeiculo(VEICULO_VAZIO);
    setPlacaManual('');
    setFonte('nenhum');
  }

  function preencherManual() {
    setManual(true);
    setFonte((f) => (f === 'falha' ? 'falha' : 'manual'));
    setPlacaManual((pm) => pm || (fonte === 'falha' ? placa : ''));
  }

  async function salvarVeiculoLocal() {
    const p = (placaManual || placa || '').toUpperCase();
    if (!p) return;
    await db.veiculosLocais.put({ placa: p, veiculo });
    setPlaca(p);
    setPlacaManual('');
    setManual(false);
    setFonte('local');
  }

  function toggleQueixa(nome: string) {
    setQueixasSel((sel) =>
      sel.includes(nome) ? sel.filter((x) => x !== nome) : [...sel, nome]
    );
  }

  async function salvarNovoTopico(nome: string) {
    const n = nome.trim();
    if (!n) return;
    if (!queixas.includes(n)) {
      await db.topicos.add({ nome: n });
    }
    setQueixasSel((sel) => (sel.includes(n) ? sel : [...sel, n]));
  }

  function adicionarItemDoCatalogo(nome: string, valor: string) {
    setItens((prev) => [
      ...prev,
      {
        id: 'i' + Date.now() + Math.random().toString(36).slice(2, 6),
        nome,
        tipo: aba === 'pecas' ? 'Peça' : 'Mão de obra',
        valor,
      },
    ]);
  }

  function removerItem(id: string) {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }

  function setValorItem(id: string, valor: string) {
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, valor } : i)));
  }

  function irGerarOrcamento() {
    const numero = String(Math.floor(1000 + Math.random() * 8999));
    setNumeroOrcamento(numero);
    setOrcamentoAtualId(undefined);
    irPara('preview');
  }

  async function salvarOrcamentoAtual(status: 'Enviado' | 'Aprovado' | 'Sem resposta' = 'Enviado') {
    if (!oficina) return;
    const registro = {
      numero: numeroOrcamento,
      placa: placa || placaManual || 'SEMPLACA',
      veiculoModelo: veiculo.modelo || 'Veículo não identificado',
      veiculo,
      cliente,
      fone,
      itens,
      fotos,
      total: totalNum,
      condicoes: oficina.condicoes,
      status,
      criadoEm: Date.now(),
      formato,
      fotosCheias,
    };
    if (orcamentoAtualId) {
      await db.orcamentos.update(orcamentoAtualId, registro);
    } else {
      const id = await db.orcamentos.add(registro);
      setOrcamentoAtualId(id as number);
    }
  }

  function abrirOrcamentoSalvo(id: number) {
    const o = (orcamentosDb ?? []).find((x) => x.id === id);
    if (!o) return;
    setPlaca(o.placa);
    setVeiculo(o.veiculo);
    setCliente(o.cliente);
    setFone(o.fone);
    setItens(o.itens);
    setFotos(o.fotos);
    setFormato(o.formato);
    setFotosCheias(o.fotosCheias);
    setNumeroOrcamento(o.numero);
    setOrcamentoAtualId(o.id);
    setFonte('local');
    irPara('preview');
  }

  if (!pronto || !oficina) {
    return <div className="app-shell" />;
  }

  return (
    <div className="app-shell">
      <Header
        tela={tela}
        kicker={tela === 'checkin' ? oficina.nome : KICKERS[tela]}
        titulo={TITULOS[tela]}
        headerTag={tela === 'historico' ? 'Offline' : (placa || placaManual || 'Offline').toUpperCase()}
        podeVoltar={tela !== 'checkin'}
        onVoltar={voltar}
      />
      <div className="content">
        {tela === 'checkin' && (
          <CheckinScreen
            placa={placa}
            placaManual={placaManual}
            veiculo={veiculo}
            fonte={fonte}
            manual={manual}
            cliente={cliente}
            fone={fone}
            clienteNovo={clienteNovo}
            queixas={queixas}
            queixasSel={queixasSel}
            onPlacaChange={onPlacaChange}
            onBuscar={onBuscarPlaca}
            onPreencherManual={preencherManual}
            onPlacaManualChange={setPlacaManual}
            onVeiculoChange={setVeiculo}
            onSalvarVeiculo={salvarVeiculoLocal}
            onClienteChange={setCliente}
            onFoneChange={setFone}
            onSalvarContato={() => baixarContatoVcf(cliente, fone)}
            onToggleQueixa={toggleQueixa}
            onSalvarNovoTopico={salvarNovoTopico}
            onContinuar={() => irPara('orcamento')}
          />
        )}
        {tela === 'orcamento' && (
          <OrcamentoScreen
            itens={itens}
            fotos={fotos}
            aba={aba}
            catalogo={catalogoDb ?? []}
            editandoIdCatalogo={editandoIdCatalogo}
            editCatalogoAberto={editCatalogoAberto}
            totalNum={totalNum}
            onSetAba={setAba}
            onAdicionarItem={adicionarItemDoCatalogo}
            onSetValorItem={setValorItem}
            onRemoverItem={removerItem}
            onSetFotos={setFotos}
            onSetEditandoIdCatalogo={setEditandoIdCatalogo}
            onSetEditCatalogoAberto={setEditCatalogoAberto}
            onGerarOrcamento={irGerarOrcamento}
          />
        )}
        {tela === 'ajustes' && (
          <AjustesScreen
            oficina={oficina}
            catalogo={catalogoDb ?? []}
            aba={aba}
            editandoIdCatalogo={editandoIdCatalogo}
            onSetAba={setAba}
            onSetEditandoIdCatalogo={setEditandoIdCatalogo}
          />
        )}
        {tela === 'historico' && (
          <HistoricoScreen
            orcamentos={orcamentosDb ?? []}
            busca={buscaHist}
            onBuscaChange={setBuscaHist}
            onAbrir={abrirOrcamentoSalvo}
          />
        )}
        {tela === 'preview' && (
          <PreviewScreen
            oficina={oficina}
            numero={numeroOrcamento}
            cliente={cliente}
            fone={fone}
            veiculo={veiculo}
            placa={placa || placaManual}
            itens={itens}
            fotos={fotos}
            totalNum={totalNum}
            formato={formato}
            fotosCheias={fotosCheias}
            enviado={enviado}
            onToggleFormato={() => setFormato((f) => (f === 'PDF' ? 'Imagem' : 'PDF'))}
            onToggleFotosCheias={() => setFotosCheias((v) => !v)}
            onSalvar={() => salvarOrcamentoAtual('Enviado')}
            onEnviado={() => setEnviado(true)}
          />
        )}
      </div>
      <TabBar telaAtual={tela} onIr={irPara} />
    </div>
  );
}
