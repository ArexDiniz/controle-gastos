import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

export default function AdicionarGasto() {
  const { categorias, formasPagamento, setGastos, gastos } = useApp();
  const [form, setForm] = useState({
    data: format(new Date(), 'yyyy-MM-dd'),
    categoria: '',
    descricao: '',
    valor: '',
    formaPagamento: '',
    observacao: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleValor = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    set('valor', raw ? (Number(raw) / 100).toFixed(2) : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.valor || !form.descricao || !form.categoria) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.gastos.add({
        data: form.data,
        descricao: form.descricao,
        valor: form.valor,
        categoria: form.categoria,
        formaPagamento: form.formaPagamento,
        observacao: form.observacao,
      });
      setGastos(prev => [...prev, {
        ID: result.id,
        Data: form.data,
        Descrição: form.descricao,
        Valor: form.valor,
        Categoria: form.categoria,
        'Forma de Pagamento': form.formaPagamento,
        Observação: form.observacao,
      }]);
      setSuccess(true);
      setForm({
        data: format(new Date(), 'yyyy-MM-dd'),
        categoria: '',
        descricao: '',
        valor: '',
        formaPagamento: '',
        observacao: '',
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Adicionar Gasto</h2>

      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5">
          <CheckCircle size={20} className="text-emerald-500 shrink-0" />
          <p className="text-sm font-medium text-emerald-700">Gasto registrado com sucesso!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
        {/* Valor em destaque */}
        <div className="text-center py-2">
          <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Valor</label>
          <div className="text-4xl font-bold text-gray-900">
            {form.valor ? fmt(form.valor) : <span className="text-gray-300">R$ 0,00</span>}
          </div>
          <input
            type="tel"
            inputMode="numeric"
            value={form.valor ? String(Math.round(Number(form.valor) * 100)) : ''}
            onChange={handleValor}
            placeholder="0"
            className="sr-only"
            id="valor-input"
          />
          <label htmlFor="valor-input" className="mt-2 inline-block text-xs text-indigo-600 cursor-pointer underline">
            Toque para editar
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data</label>
            <input
              type="date"
              value={form.data}
              onChange={e => set('data', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valor *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.valor}
              onChange={e => set('valor', e.target.value)}
              placeholder="0,00"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Descrição *</label>
          <input
            type="text"
            value={form.descricao}
            onChange={e => set('descricao', e.target.value)}
            placeholder="Ex: Almoço, Uber, Mercado..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Categoria *</label>
          <select
            value={form.categoria}
            onChange={e => set('categoria', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            required
          >
            <option value="">Selecione...</option>
            {categorias.map(c => (
              <option key={c.ID} value={c.Nome}>{c.Nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Forma de pagamento</label>
          <div className="flex flex-wrap gap-2">
            {formasPagamento.map(f => (
              <button
                key={f.ID}
                type="button"
                onClick={() => set('formaPagamento', f.Nome)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                  form.formaPagamento === f.Nome
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {f.Nome}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Observação</label>
          <input
            type="text"
            value={form.observacao}
            onChange={e => set('observacao', e.target.value)}
            placeholder="Opcional..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60 mt-1"
        >
          {loading ? 'Salvando...' : 'Salvar Gasto'}
        </button>
      </form>
    </div>
  );
}
