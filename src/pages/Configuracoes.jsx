import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Plus, Trash2, Pencil, Check, X, Link, RefreshCw, Trash } from 'lucide-react';

function CrudList({ title, items, onAdd, onUpdate, onDelete }) {
  const [novo, setNovo] = useState('');
  const [editando, setEditando] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!novo.trim()) return;
    setLoading(true);
    await onAdd(novo.trim());
    setNovo('');
    setLoading(false);
  };

  const handleUpdate = async (id) => {
    if (!editVal.trim()) return;
    await onUpdate(id, editVal.trim());
    setEditando(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
      <div className="px-4 pt-4 pb-3 border-b border-gray-50">
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      <ul className="divide-y divide-gray-50">
        {items.length === 0 && <li className="px-4 py-3 text-sm text-gray-400">Nenhum item cadastrado</li>}
        {items.map(item => (
          <li key={item.ID} className="flex items-center justify-between px-4 py-2.5">
            {editando === item.ID ? (
              <div className="flex items-center gap-2 flex-1">
                <input value={editVal} onChange={e => setEditVal(e.target.value)} className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button onClick={() => handleUpdate(item.ID)} className="p-1.5 rounded-lg bg-indigo-600 text-white"><Check size={13} /></button>
                <button onClick={() => setEditando(null)} className="p-1.5 rounded-lg border border-gray-200 text-gray-400"><X size={13} /></button>
              </div>
            ) : (
              <>
                <span className="text-sm text-gray-800">{item.Nome}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditando(item.ID); setEditVal(item.Nome); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Pencil size={13} /></button>
                  <button onClick={() => onDelete(item.ID)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex gap-2 p-3 border-t border-gray-50">
        <input
          value={novo}
          onChange={e => setNovo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Novo item..."
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button onClick={handleAdd} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Configuracoes() {
  const { scriptUrl, setScriptUrl, clearData, categorias, setCategorias, formasPagamento, setFormasPagamento, loadAll } = useApp();
  const navigate = useNavigate();
  const [novaUrl, setNovaUrl] = useState(scriptUrl);
  const [salvandoUrl, setSalvandoUrl] = useState(false);

  const salvarUrl = async () => {
    setSalvandoUrl(true);
    try {
      const res = await fetch(`${novaUrl}?sheet=Gastos`);
      if (!res.ok) throw new Error();
      setScriptUrl(novaUrl);
      await loadAll();
      alert('Planilha atualizada com sucesso!');
    } catch {
      alert('Não foi possível conectar. Verifique o link.');
    }
    setSalvandoUrl(false);
  };

  const handleClearData = () => {
    if (confirm('Deseja desconectar a planilha e limpar todos os dados locais?')) {
      clearData();
      navigate('/');
    }
  };

  // Categorias CRUD
  const addCategoria = async (nome) => {
    const r = await api.categorias.add(nome);
    setCategorias(prev => [...prev, { ID: r.id, Nome: nome }]);
  };
  const updateCategoria = async (id, nome) => {
    await api.categorias.update(id, nome);
    setCategorias(prev => prev.map(c => c.ID === id ? { ...c, Nome: nome } : c));
  };
  const deleteCategoria = async (id) => {
    await api.categorias.delete(id);
    setCategorias(prev => prev.filter(c => c.ID !== id));
  };

  // Formas de pagamento CRUD
  const addForma = async (nome) => {
    const r = await api.formasPagamento.add(nome);
    setFormasPagamento(prev => [...prev, { ID: r.id, Nome: nome }]);
  };
  const updateForma = async (id, nome) => {
    await api.formasPagamento.update(id, nome);
    setFormasPagamento(prev => prev.map(f => f.ID === id ? { ...f, Nome: nome } : f));
  };
  const deleteForma = async (id) => {
    await api.formasPagamento.delete(id);
    setFormasPagamento(prev => prev.filter(f => f.ID !== id));
  };

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Configurações</h2>

      {/* Planilha */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2"><Link size={14} /> Planilha vinculada</h3>
        <input
          type="url"
          value={novaUrl}
          onChange={e => setNovaUrl(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-2">
          <button onClick={salvarUrl} disabled={salvandoUrl} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium disabled:opacity-60">
            {salvandoUrl ? 'Salvando...' : 'Salvar link'}
          </button>
          <button onClick={loadAll} className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Categorias */}
      <CrudList
        title="Categorias"
        items={categorias}
        onAdd={addCategoria}
        onUpdate={updateCategoria}
        onDelete={deleteCategoria}
      />

      {/* Formas de pagamento */}
      <CrudList
        title="Formas de pagamento"
        items={formasPagamento}
        onAdd={addForma}
        onUpdate={updateForma}
        onDelete={deleteForma}
      />

      {/* Zona de perigo */}
      <div className="bg-white rounded-2xl border border-red-100 p-4">
        <h3 className="font-semibold text-red-600 text-sm mb-2 flex items-center gap-2"><Trash size={14} /> Zona de perigo</h3>
        <p className="text-xs text-gray-500 mb-3">Remove a planilha vinculada e limpa os dados salvos localmente.</p>
        <button onClick={handleClearData} className="w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition">
          Desconectar planilha
        </button>
      </div>
    </div>
  );
}
