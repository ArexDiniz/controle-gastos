import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { parseISO, isWithinInterval, format } from 'date-fns';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];
const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

export default function Relatorios() {
  const { gastos } = useApp();
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [aba, setAba] = useState('categoria');

  const filtrados = useMemo(() => {
    return gastos.filter(g => {
      if (!g.Data) return false;
      try {
        const d = parseISO(g.Data);
        if (dataInicio && d < parseISO(dataInicio)) return false;
        if (dataFim && d > parseISO(dataFim)) return false;
        return true;
      } catch { return false; }
    });
  }, [gastos, dataInicio, dataFim]);

  const porCategoria = useMemo(() => {
    const map = {};
    filtrados.forEach(g => { const k = g.Categoria || 'Sem cat.'; map[k] = (map[k] || 0) + (Number(g.Valor) || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtrados]);

  const porPagamento = useMemo(() => {
    const map = {};
    filtrados.forEach(g => { const k = g['Forma de Pagamento'] || 'Outro'; map[k] = (map[k] || 0) + (Number(g.Valor) || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtrados]);

  const porMes = useMemo(() => {
    const map = {};
    filtrados.forEach(g => { const k = g.Data?.slice(0, 7) || ''; if (k) map[k] = (map[k] || 0) + (Number(g.Valor) || 0); });
    return Object.entries(map).sort().map(([mes, total]) => ({ mes, total }));
  }, [filtrados]);

  const total = filtrados.reduce((s, g) => s + (Number(g.Valor) || 0), 0);

  const abas = [
    ['categoria', 'Por Categoria'],
    ['pagamento', 'Por Pagamento'],
    ['mes', 'Por Mês'],
  ];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Relatórios</h2>

      {/* Filtro período */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Data início</label>
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Data fim</label>
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      {/* Totalizador */}
      <div className="bg-indigo-600 rounded-2xl p-4 mb-5 flex items-center justify-between">
        <p className="text-indigo-100 text-sm">{filtrados.length} lançamentos</p>
        <p className="text-white font-bold text-lg">{fmt(total)}</p>
      </div>

      {/* Abas */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {abas.map(([v, l]) => (
          <button key={v} onClick={() => setAba(v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${aba === v ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Gráfico por categoria */}
      {aba === 'categoria' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={porCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {porCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100"><th className="text-left p-3 text-gray-500 font-medium">Categoria</th><th className="text-right p-3 text-gray-500 font-medium">Total</th><th className="text-right p-3 text-gray-500 font-medium">%</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {porCategoria.map((c, i) => (
                  <tr key={i}>
                    <td className="p-3 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />{c.name}</td>
                    <td className="p-3 text-right font-semibold">{fmt(c.value)}</td>
                    <td className="p-3 text-right text-gray-400">{total ? ((c.value / total) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gráfico por pagamento */}
      {aba === 'pagamento' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={porPagamento} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={v => fmt(v)} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {porPagamento.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100"><th className="text-left p-3 text-gray-500 font-medium">Forma</th><th className="text-right p-3 text-gray-500 font-medium">Total</th><th className="text-right p-3 text-gray-500 font-medium">%</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {porPagamento.map((c, i) => (
                  <tr key={i}>
                    <td className="p-3 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />{c.name}</td>
                    <td className="p-3 text-right font-semibold">{fmt(c.value)}</td>
                    <td className="p-3 text-right text-gray-400">{total ? ((c.value / total) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gráfico por mês */}
      {aba === 'mes' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porMes}>
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                <Tooltip formatter={v => fmt(v)} />
                <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100"><th className="text-left p-3 text-gray-500 font-medium">Mês</th><th className="text-right p-3 text-gray-500 font-medium">Total</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {porMes.map((m, i) => (
                  <tr key={i}>
                    <td className="p-3">{m.mes}</td>
                    <td className="p-3 text-right font-semibold">{fmt(m.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
