import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useData } from '../../hooks/useData';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { demo, setDemo } = useData();

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={`transition-[padding] duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <Header onMenu={() => setMobileOpen(true)} />
        {demo && (
          <div role="status" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-100 px-4 py-2 text-center text-xs font-bold text-amber-900">
            <FlaskConical size={14} aria-hidden="true" />
            Demo data: showing the static figures from the project brief, not live backend results.
            <button onClick={() => setDemo(false)} className="underline underline-offset-2 hover:text-amber-700">Switch to live data</button>
          </div>
        )}
        <main className="mx-auto w-full max-w-[1500px] space-y-8 p-4 md:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
