import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Wallet } from 'lucide-react';

export default function Setup() {
  const { setScriptUrl } = useApp();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${url.trim()}?sheet=Gastos`);
      if (!res.ok) throw new Error('Não foi possível conectar');
      setScriptUrl(url.trim());
      navigate('/dashboard');
    } catch {
      setError('Não foi possível conectar. Verifique o link e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-white">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Wallet size={32} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Controle de Gastos</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Conecte sua planilha para começar</p>

        <form onSubmit={handleConnect} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Link do Google Apps Script
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60"
          >
            {loading ? 'Conectando...' : 'Conectar Planilha'}
          </button>
        </form>
      </div>
    </div>
  );
}
