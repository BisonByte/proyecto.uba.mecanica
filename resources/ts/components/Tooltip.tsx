import { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip = ({ children, content, position = 'top' }: TooltipProps): JSX.Element => {
  const positionClasses = {
    top: '-translate-x-1/2 -translate-y-full left-1/2 bottom-[calc(100%+0.5rem)]',
    bottom: '-translate-x-1/2 translate-y-2 left-1/2 top-full',
    left: '-translate-x-full -translate-y-1/2 top-1/2 right-[calc(100%+0.5rem)]',
    right: 'translate-x-2 -translate-y-1/2 top-1/2 left-full',
  };

  return (
    <div className="group relative inline-block">
      {children}
      <div
        className={`pointer-events-none absolute z-50 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:block group-hover:opacity-100 ${positionClasses[position]}`}
      >
        {content}
        <div
          className={`absolute h-2 w-2 rotate-45 bg-slate-900 ${
            position === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2' :
            position === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2' :
            position === 'left' ? '-right-1 top-1/2 -translate-y-1/2' :
            '-left-1 top-1/2 -translate-y-1/2'
          }`}
        />
      </div>
    </div>
  );
};

export default Tooltip;