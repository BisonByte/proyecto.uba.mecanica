import { NavLink, Outlet } from 'react-router-dom';
import { HYDRAULIC_DESIGNER_ROUTES } from './constants';
import {
  HydraulicDesignerLayoutProvider,
  useHydraulicDesignerLayout,
  type HydraulicDesignerLayoutContext,
} from './LayoutContext';

const LayoutShell = (): JSX.Element => {
  const { isFullscreen, setIsFullscreen } = useHydraulicDesignerLayout();

  const navigation = HYDRAULIC_DESIGNER_ROUTES;

  const containerClassName = isFullscreen
    ? 'fixed inset-0 z-[70] overflow-auto bg-slate-950/95 px-4 py-6 sm:px-6 lg:px-10'
    : 'px-4 py-10 sm:px-6 lg:px-10';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className={containerClassName}>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
          <aside className="lg:w-56">
            <nav className="sticky top-6 space-y-2 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Navegación</p>
              <ul className="mt-4 space-y-1 text-sm">
                {navigation.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center justify-between gap-3 rounded-xl border px-3 py-2 font-semibold uppercase tracking-[0.2em] transition ${
                          isActive
                            ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100 shadow-inner shadow-cyan-500/10'
                            : 'border-white/5 bg-transparent text-white/60 hover:border-cyan-400/40 hover:text-white'
                        }`
                      }
                    >
                      {item.label}
                      <span aria-hidden className="text-[10px] text-white/40">
                        {item.path.replace(/^\//, '') || 'inicio'}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <section className="flex-1">
            <Outlet context={{ isFullscreen, setIsFullscreen } satisfies HydraulicDesignerLayoutContext } />
          </section>
        </div>
      </div>
    </div>
  );
};

const HydraulicDesignerLayout = (): JSX.Element => {
  return (
    <HydraulicDesignerLayoutProvider>
      <LayoutShell />
    </HydraulicDesignerLayoutProvider>
  );
};

export default HydraulicDesignerLayout;
