import { useState } from 'react';
import DesignerToolbar from '../../dashboard/DesignerToolbar';
import { useModelStore } from '../../state/store';

const LibraryPage = (): JSX.Element => {
  const { addTank, addPump, addJunction } = useModelStore((state) => ({
    addTank: state.addTank,
    addPump: state.addPump,
    addJunction: state.addJunction,
  }));
  const [pipeToolActive, setPipeToolActive] = useState(false);

  return (
    <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">Biblioteca</p>
        <h2 className="text-2xl font-semibold text-white">Componentes disponibles</h2>
        <p className="max-w-2xl text-sm text-white/60">
          Arrastra elementos desde la biblioteca para construir tu red. Puedes activarlos directamente desde aquí y volver al tablero para posicionarlos.
        </p>
      </header>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-slate-950/10">
        <DesignerToolbar
          onAddTank={() => addTank()}
          onAddPump={() => addPump()}
          onAddJunction={() => addJunction()}
          pipeToolActive={pipeToolActive}
          onStartPipe={() => setPipeToolActive(true)}
          onCancelPipe={() => setPipeToolActive(false)}
        />
      </div>
    </section>
  );
};

export default LibraryPage;
