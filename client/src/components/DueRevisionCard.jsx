import { Clock } from 'lucide-react';

export default function DueRevisionCard({ count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-sky-400 dark:bg-sky-500 rounded-xl p-5 shadow-sm transition-all hover:brightness-105 ${
        active ? 'ring-2 ring-sky-600 ring-offset-2 dark:ring-offset-slate-950' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900/80">Due for Revision</p>
          <p className="text-4xl font-bold text-slate-900 mt-1">{count}</p>
          <p className="text-sm text-slate-900/70 mt-1">
            {active ? 'Showing due questions — click to clear filter' : 'Click to filter due questions'}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-sky-500/30 dark:bg-sky-600/30">
          <Clock className="w-8 h-8 text-slate-900/70" />
        </div>
      </div>
    </button>
  );
}
