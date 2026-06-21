const getScriptUrl = () => localStorage.getItem('scriptUrl');

async function request(action, payload = {}) {
  const url = getScriptUrl();
  if (!url) throw new Error('Planilha não configurada');

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

async function fetchAll(sheet) {
  const url = getScriptUrl();
  if (!url) throw new Error('Planilha não configurada');
  const res = await fetch(`${url}?sheet=${sheet}`);
  return res.json();
}

export const api = {
  gastos: {
    list: () => fetchAll('Gastos'),
    add: (data) => request('add', { sheet: 'Gastos', ...data }),
    update: (id, data) => request('update', { sheet: 'Gastos', id, ...data }),
    delete: (id) => request('delete', { sheet: 'Gastos', id }),
  },
  categorias: {
    list: () => fetchAll('Categorias'),
    add: (nome) => request('add', { sheet: 'Categorias', nome }),
    update: (id, nome) => request('update', { sheet: 'Categorias', id, nome }),
    delete: (id) => request('delete', { sheet: 'Categorias', id }),
  },
  formasPagamento: {
    list: () => fetchAll('FormasPagamento'),
    add: (nome) => request('add', { sheet: 'FormasPagamento', nome }),
    update: (id, nome) => request('update', { sheet: 'FormasPagamento', id, nome }),
    delete: (id) => request('delete', { sheet: 'FormasPagamento', id }),
  },
};
