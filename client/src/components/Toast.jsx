import { CheckCircle2, XCircle, X, Undo2 } from 'lucide-react';

const styles = {
  success: 'bg-slate-900 dark:bg-slate-800 border-green-500/50 text-white',
  error: 'bg-slate-900 dark:bg-slate-800 border-red-500/50 text-white',
};

const iconColors = {
  success: 'text-green-400',
  error: 'text-red-400',
};

export default function Toast({ toasts, onRemove, onUndo }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = toast.type === 'error' ? XCircle : CheckCircle2;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[260px] max-w-sm ${styles[toast.type]}`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${iconColors[toast.type]}`} />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            {toast.undoData && (
              <button
                onClick={() => onUndo?.(toast)}
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                <Undo2 className="w-3.5 h-3.5" /> Undo
              </button>
            )}
            <button onClick={() => onRemove(toast.id)} className="p-0.5 rounded hover:bg-white/10">
              <X className="w-4 h-4 opacity-60" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
