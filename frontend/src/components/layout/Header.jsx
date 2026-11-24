import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, RefreshCw, ChevronRight } from 'lucide-react';
import { NAV, DATASET_ROUTES } from '../../utils/nav';
import { DATASET_FACTS, DATASET_KEYS } from '../../utils/constants';
import { useData } from '../../hooks/useData';
import Keycap from '../common/Keycap';
import ConnectionPill from './ConnectionPill';

/** Top bar: title + breadcrumb, then a row of keycaps (keyboard shortcuts 1-8, R to refresh). */
export default function Header({ onMenu }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { dataset, setDataset, refresh, loading } = useData();
  const [pressed, setPressed] = useState(null);

  const current = NAV.find((n) => n.to === pathname) || NAV[0];
  const showDataset = DATASET_ROUTES.includes(pathname);

  const flash = useCallback((k) => {
    setPressed(k);
    window.setTimeout(() => setPressed(null), 170);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable) return;
      const item = NAV.find((n) => n.key === e.key);
      if (item) {
        navigate(item.to);
        flash(item.key);
      } else if (e.key.toLowerCase() === 'r') {
        refresh();
        flash('r');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, refresh, flash]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 pb-1 pt-3 md:px-6 xl:px-8">
        <Keycap onClick={onMenu} className="lg:hidden" aria-label="Open navigation menu">
          <Menu size={16} aria-hidden="true" />
        </Keycap>
        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs font-semibold text-slate-400">
            <Link to="/" className="transition hover:text-indigo-600">Federated Academic Analyzer</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-slate-500" aria-current="page">{current.label}</span>
          </nav>
          <h1 className="truncate text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">{current.label}</h1>
        </div>
        <div className="hidden sm:block"><ConnectionPill /></div>
        <div className="sm:hidden"><ConnectionPill short /></div>
        <Keycap onClick={() => { refresh(); flash('r'); }} pressed={pressed === 'r'} hint="R" aria-label="Refresh data from the backend">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          <span className="hidden md:inline">Refresh</span>
        </Keycap>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 pt-2.5 md:px-6 xl:px-8" role="toolbar" aria-label="Quick navigation keys">
        {NAV.slice(0, 7).map(({ to, short, icon: Icon, key }) => (
          <Keycap key={to} as={Link} to={to} active={pathname === to} pressed={pressed === key} hint={key} aria-current={pathname === to ? 'page' : undefined}>
            <Icon size={14} aria-hidden="true" />
            {short}
          </Keycap>
        ))}
        {showDataset && (
          <>
            <span className="mx-1 h-6 w-px shrink-0 bg-slate-300" aria-hidden="true" />
            <span className="shrink-0 text-xs font-bold text-slate-500">Dataset</span>
            {DATASET_KEYS.map((k) => (
              <Keycap key={k} active={dataset === k} aria-pressed={dataset === k} onClick={() => setDataset(k)}>
                {DATASET_FACTS[k].short}
              </Keycap>
            ))}
          </>
        )}
      </div>
    </header>
  );
}
