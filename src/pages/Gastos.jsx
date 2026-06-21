import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Trash2, Pencil, X, Check, SlidersHorizontal } from 'lucide-react';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

export default function Gastos() {
  const { gastos, setGastos, categorias, formasPagamento } = useApp();
  const [filtros, setFiltros] = useState({ texto: '', categoria: '', pagamento: '', dataInicio: '', dataFim: '', valorMin: '', valorMax: '' });
  const [showFiltros, setShowFiltros] = useState(false);
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deletando, setDeletando] = useState(null);

  const setF = (k, v) => setFiltros(f => ({ ...f, [k]: v }));

  const filtrados = useMemo(() => {
    return gastos.filter(g => {
      if (filtros.texto && !g.Descrição?.toLowerCase().includes(filtros.texto.toLowerCase())) return false;
      if (filtros.categoria && g.Categoria !== filtros.categoria) return false;
      if (filtros.pagamento && g['Forma de Pagamento'] !== filtros.pagamento) return false;
      if (filtros.valorMin && Number(g.Valor) < Number(filtros.valorMin)) return false;
      if (filtros.valorMax && Number(g.Valor) > Number(filtros.valorMax)) return false;
      if (filtros.dataInicio || filtros.dataFim) {
        try {
          const date = parseISO(g.Data);
          if (filtros.dataInicio && date < parseISO(filtros.dataInicio)) return false;
          if (filtros.dataFim && date > parseISO(filtros.dataFim)) return false;
        } catch { return false; }
      }
      return true;
    }).sort((a, b) => b.Data?.localeCompare(a.Data));
  }, [gastos, filtros]);

  const totalFiltrado = filtrados.reduce((s, g) => s + (Number(g.Valor) || 0), 0);

  const iniciarEdicao = (g) => {
    setEditando(g.ID);
    setEditForm({
      data: g.Data || '',
      descricao: g.Descrição || '',
      valor: g.Valor || '',
      categoria: g.Categoria || '',
      formaPagamento: g['Forma de Pagamento'] || '',
      observacao: g.Observação || '',
    });
  };

  const salvarEdicao = async (id) => {
    try {
      await api.gastos.update(id, editForm);
      setGastos(prev => prev.map(g => g.ID === id ? {
        ...g,
        Data: editForm.data,
        Descrição: editForm.descricao,
        Valor: editForm.valor,
        Categoria: editForm.categoria,
        'Forma de Pagamento': editForm.formaPagamento,
        Observação: editForm.observacao,
      } : g));
      setEditando(null);
    } catch { alert('Erro ao salvar'); }
  };

  const excluir = async (id) => {
    setDeletando(id);
    try {
      await api.gastos.delete(id);
      setGastos(prev => prev.filter(g => g.ID !== id));
    } catch { alert('Erro ao excluir'); }
    setDeletando(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Gastos</h2>
        <button onClick={() => setShowFiltros(!showFiltros)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition border ${showFiltros ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>
          <SlidersHorizontal size={14} /> Filtros
        </button>
      </div>

      {/* Busca rápida */}
      <input
        type="text"
        value={filtros.texto}
        onChange={e => setF('texto', e.target.value)}
        placeholder="Buscar por descrição..."
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Filtros avançados */}
      {showFiltros && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Categoria</label>
            <select value={filtros.categoria} onChange={e => setF('categoria', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Todas</option>
              {categorias.map(c => <option key={c.ID} value={c.Nome}>{c.Nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Pagamento</label>
            <select value={filtros.pagamento} onChange={e => setF('pagamento', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Todos</option>
              {formasPagamento.map(f => <option key={f.ID} value={f.Nome}>{f.Nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Data início</label>
            <input type="date" value={filtros.dataInicio} onChange={e => setF('dataInicio', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Data fim</label>
            <input type="date" value={filtros.dataFim} onChange={e => setF('dataFim', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Valor mín.</label>
            <input type="number" value={filtros.valorMin} onChange={e => setF('valorMin', e.target.value)} placeholder="0,00" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Valor máx.</label>
            <input type="number" value={filtros.valorMax} onChange={e => setF('valorMax', e.target.value)} placeholder="0,00" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="col-span-2">
            <button onClick={() => setFiltros({ texto: '', categoria: '', pagamento: '', dataInicio: '', dataFim: '', valorMin: '', valorMax: '' })} className="text-xs text-indigo-600 underline">Limpar filtros</button>
          </div>
        </div>
      )}

      {/* Totalizador */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-500">{filtrados.length} registro(s)</span>
        <span className="text-sm font-bold text-gray-900">{fmt(totalFiltrado)}</span>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Nenhum gasto encontrado</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map(g => (
            <div key={g.ID} className="bg-white rounded-2xl border border-gray-100 p-4">
              {editando === g.ID ? (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={editForm.data} onChange={e => setEditForm(f => ({ ...f, data: e.target.value }))} className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="number" value={editForm.valor} onChange={e => setEditForm(f => ({ ...f, valor: e.target.value }))} className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <input type="text" value={editForm.descricao} onChange={e => setEditForm(f => ({ ...f, descricao: e.target.value }))} className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <select value={editForm.categoria} onChange={e => setEditForm(f => ({ ...f, categoria: e.target.value }))} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Categoria...</option>
                    {categorias.map(c => <option key={c.ID} value={c.Nome}>{c.Nome}</option>)}
                  </select>
                  <select value={editForm.formaPagamento} onChange={e => setEditForm(f => ({ ...f, formaPagamento: e.target.value }))} className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Pagamento...</option>
                    {formasPagamento.map(f => <option key={f.ID} value={f.Nome}>{f.Nome}</option>)}
                  </select>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditando(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600"><X size={14} /></button>
                    <button onClick={() => salvarEdicao(g.ID)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm"><Check size={14} /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{g.Descrição}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{g.Categoria} · {g['Forma de Pagamento'] || '—'} · {g.Data}</p>
                    {g.Observação && <p className="text-xs text-gray-400 mt-0.5 italic">{g.Observação}</p>}
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <span className="text-sm font-bold text-gray-900">{fmt(g.Valor)}</span>
                    <button onClick={() => iniciarEdicao(g)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Pencil size={14} /></button>
                    <button onClick={() => excluir(g.ID)} disabled={deletando === g.ID} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 disabled:opacity-40"><Trash2 size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
