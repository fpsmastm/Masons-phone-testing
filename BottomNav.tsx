import { useApp, type Page } from '../store';

const navItems: { page: Page; label: string; icon: string }[] = [
  { page: 'home', label: 'Home', icon: '🏠' },
  { page: 'contacts', label: 'People', icon: '👥' },
  { page: 'world', label: 'World', icon: '🌍' },
  { page: 'files', label: 'Files', icon: '📁' },
  { page: 'settings', label: 'Settings', icon: '⚙️' },
];

export function BottomNav() {
  const { state, dispatch } = useApp();

  if (state.page === 'setup' || state.page === 'call') return null;

  return (
    <nav className="glass border-t border-white/5 flex items-center justify-around py-2 px-1 relative z-40">
      {navItems.map(item => {
        const isActive = state.page === item.page ||
          (item.page === 'contacts' && state.page === 'chat');
        return (
          <button
            key={item.page}
            onClick={() => dispatch({ type: 'SET_PAGE', page: item.page })}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative ${
              isActive
                ? 'bg-blue-500/20 text-blue-300 scale-105'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
