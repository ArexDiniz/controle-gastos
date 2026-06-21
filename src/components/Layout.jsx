import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, List, BarChart2, Settings,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/adicionar', icon: PlusCircle, label: 'Adicionar' },
  { to: '/gastos', icon: List, label: 'Gastos' },
  { to: '/relatorios', icon: BarChart2, label: 'Relatórios' },
  { to: '/configuracoes', icon: Settings, label: 'Config.' },
];

export default function Layout({ children }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 py-6 px-3 shrink-0">
        <div className="px-3 mb-8">
          <h1 className="text-lg font-bold text-indigo-600">Controle de Gastos</h1>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-50">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-indigo-600' : 'text-gray-400'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
