import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { format } from 'date-fns';
import { CheckCircle, ChevronDown } from 'lucide-react';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

export default function AdicionarGasto() {
  const { categorias, formasPagamento, setGastos } = useApp();
  const [centavos, setCentavos] = useState('');
  const [categoria, setCategoria] = useState('');
  const [pagamento, setPagamento] = useState('');
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [observacao, setObservacao] = useState('');
  const [showObs, setShowObs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const valorNumerico = centavos ? (Number(centavos) / 100).toFixed(2) : '';
  const valorDisplay = centavos
    ? fmt(Number(centavos) / 100)
    : <span className="text-gray-300">R$ 0,00</span>;

  const handleDigit = (d) => {
    if (centavos.length >= 10) return;
    setCentavos(prev => (prev === '' && d === '0') ? '' : prev + d);
  };

  const handleBackspace = () => setCentavos(prev => prev.slice(0, -1));

  const canSave = centavos && categoria;

  const handleSave = async () => {
    if (!canSave) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.gastos.add({
        data,
        descricao: categoria,
        valor: valorNumerico,
        categoria,
        formaPagamento: pagamento,
        observacao,
      });
      setGastos(prev => [...prev, {
        ID: result.id,
        Data: data,
        Descrição: categoria,
        Valor: valorNumerico,
        Categoria: categoria,
        'Forma de Pagamento': pagamento,
        Observação: observacao,
      }]);
      setCentavos('');
      setCategoria('');
      setPagamento('');
      setObservacao('');
      setShowObs(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const pad = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div className="flex flex-col h-full max-w-sm mx-auto px-4 pt-4 pb-2">

      {/* Feedback de sucesso */}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-3 animate-pulse">
          <CheckCircle size={18} className="text-emerald-500 shrink-0" />
          <p className="text-sm font-medium text-emerald-700">Gasto salvo!</p>
        </div>
      )}

      {/* Valor */}
      <div className="text-center mb-4">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Valor</p>
        <div className="text-5xl font-bold text-gray-900 tracking-tight">{valorDisplay}</div>
      </div>

      {/* Data */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <input
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
          className="text-sm text-gray-500 border-0 bg-transparent text-center focus:outline-none focus:ring-0 cursor-pointer"
        />
      </div>

      {/* Categorias */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-2">Categoria</p>
        <div className="flex flex-wrap gap-2">
          {categorias.map(c => (
            <button
              key={c.ID}
              onClick={() => setCategoria(c.Nome)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition active:scale-95 ${
                categoria === c.Nome
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {c.Nome}
            </button>
          ))}
        </div>
      </div>

      {/* Forma de pagamento */}
      {formasPagamento.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Pagamento</p>
          <div className="flex flex-wrap gap-2">
            {formasPagamento.map(f => (
              <button
                key={f.ID}
                onClick={() => setPagamento(prev => prev === f.Nome ? '' : f.Nome)}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition active:scale-95 ${
                  pagamento === f.Nome
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {f.Nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Observação (opcional) */}
      <button
        onClick={() => setShowObs(!showObs)}
        className="flex items-center gap-1 text-xs text-gray-400 mb-2 self-start"
      >
        <ChevronDown size={13} className={`transition-transform ${showObs ? 'rotate-180' : ''}`} />
        Observação (opcional)
      </button>
      {showObs && (
        <input
          type="text"
          value={observacao}
          onChange={e => setObservacao(e.target.value)}
          placeholder="Adicionar nota..."
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}

      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      {/* Teclado numérico */}
      <div className="mt-auto">
        <div className="grid grid-cols-3 gap-1 mb-3">
          {pad.map((d, i) => (
            d === '' ? <div key={i} /> :
            d === '⌫' ? (
              <button
                key={i}
                onPointerDown={handleBackspace}
                className="h-14 flex items-center justify-center rounded-2xl bg-gray-100 text-gray-600 text-xl active:bg-gray-200 transition select-none"
              >
                {d}
              </button>
            ) : (
              <button
                key={i}
                onPointerDown={() => handleDigit(d)}
                className="h-14 flex items-center justify-center rounded-2xl bg-gray-100 text-gray-800 text-xl font-semibold active:bg-indigo-100 active:text-indigo-700 transition select-none"
              >
                {d}
              </button>
            )
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave || loading}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-base disabled:opacity-40 active:scale-95 transition"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}
