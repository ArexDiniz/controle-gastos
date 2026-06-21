import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { format, isThisMonth, isToday, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid,
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, Tag, RefreshCw } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

export default function Dashboard() {
  const { gastos, loading, loadAll } = useApp();
  const [periodo, setPeriodo] = useState('mes');

  const filtered = useMemo(() => {
    return gastos.filter((g) => {
      if (!g.Data) return false;
      try {
        const date = parseISO(g.Data);
        if (periodo === 'hoje') return isToday(date);
        if (periodo === 'mes') return isThisMonth(date);
        return true;
      } catch { return false; }
    });
  }, [gastos, periodo]);

  const totalMes = useMemo(() =>
    gastos.filter(g => { try { return isThisMonth(parseISO(g.Data)); } catch { return false; } })
      .reduce((s, g) => s + (Number(g.Valor) || 0), 0), [gastos]);

  const totalHoje = useMemo(() =>
    gastos.filter(g => { try { return isToday(parseISO(g.Data)); } catch { return false; } })
      .reduce((s, g) => s + (Number(g.Valor) || 0), 0), [gastos]);

  const porCategoria = useMemo(() => {
    const map = {};
    filtered.forEach(g => {
      const cat = g.Categoria || 'Sem categoria';
      map[cat] = (map[cat] || 0) + (Number(g.Valor) || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const porPagamento = useMemo(() => {
    const map = {};
    filtered.forEach(g => {
      const fp = g['Forma de Pagamento'] || 'Outro';
      map[fp] = (map[fp] || 0) + (Number(g.Valor) || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const evolucao = useMemo(() => {
    const map = {};
    filtered.forEach(g => {
      const key = g.Data?.slice(0, 7) || '';
      if (key) map[key] = (map[key] || 0) + (Number(g.Valor) || 0);
    });
    return Object.entries(map).sort().map(([mes, total]) => ({ mes, total }));
  }, [filtered]);

  const topCategoria = porCategoria[0];
  const ultimos = [...filtered].sort((a, b) => b.Data?.localeCompare(a.Data)).slice(0, 5);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-gray-900 text-sm mt-0.5">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <button onClick={loadAll} disabled={loading} className="p-2 rounded-xl hover:bg-gray-100 transition">
          <RefreshCw size={16} className={loading ? 'animate-spin text-indigo-500' : 'text-gray-400'} />
        </button>
      </div>

      {/* Filtro período */}
      <div className="flex gap-2 mb-5">
        {[['hoje', 'Hoje'], ['mes', 'Este mês'], ['tudo', 'Tudo']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setPeriodo(v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              periodo === v ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard icon={DollarSign} label="Total no mês" value={fmt(totalMes)} color="bg-indigo-500" />
        <StatCard icon={Calendar} label="Total hoje" value={fmt(totalHoje)} color="bg-violet-500" />
        <StatCard icon={TrendingUp} label="Lançamentos" value={`${filtered.length} gastos`} color="bg-pink-500" />
        <StatCard icon={Tag} label="Top categoria" value={topCategoria?.name || '—'} color="bg-amber-500" />
      </div>

      {/* Últimos lançamentos */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-5">
        <div className="px-4 pt-4 pb-2">
          <h3 className="font-semibold text-gray-800 text-sm">Últimos lançamentos</h3>
        </div>
        {ultimos.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">Nenhum lançamento</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {ultimos.map((g, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{g.Descrição}</p>
                  <p className="text-xs text-gray-400">{g.Categoria} · {g.Data}</p>
                </div>
                <span className="text-sm font-bold text-gray-900">{fmt(g.Valor)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Gráfico por categoria */}
      {porCategoria.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
          <h3 className="font-semibold text-gray-800 text-sm mb-4">Gastos por categoria</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={porCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {porCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {porCategoria.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráfico por forma de pagamento */}
      {porPagamento.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
          <h3 className="font-semibold text-gray-800 text-sm mb-4">Por forma de pagamento</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={porPagamento} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Evolução mensal */}
      {evolucao.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-4">Evolução mensal</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={evolucao}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
