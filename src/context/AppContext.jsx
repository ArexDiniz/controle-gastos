import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [scriptUrl, setScriptUrlState] = useState(() => localStorage.getItem('scriptUrl') || '');
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setScriptUrl = (url) => {
    localStorage.setItem('scriptUrl', url);
    setScriptUrlState(url);
  };

  const clearData = () => {
    localStorage.removeItem('scriptUrl');
    setScriptUrlState('');
    setGastos([]);
    setCategorias([]);
    setFormasPagamento([]);
  };

  const loadAll = useCallback(async () => {
    if (!scriptUrl) return;
    setLoading(true);
    setError(null);
    try {
      const [g, c, f] = await Promise.all([
        api.gastos.list(),
        api.categorias.list(),
        api.formasPagamento.list(),
      ]);
      setGastos(Array.isArray(g) ? g : []);
      setCategorias(Array.isArray(c) ? c : []);
      setFormasPagamento(Array.isArray(f) ? f : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [scriptUrl]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <AppContext.Provider value={{
      scriptUrl, setScriptUrl, clearData,
      gastos, setGastos,
      categorias, setCategorias,
      formasPagamento, setFormasPagamento,
      loading, error, loadAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
