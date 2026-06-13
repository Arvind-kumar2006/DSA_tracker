import { useState } from 'react';
import { Eye, EyeOff, ExternalLink, RotateCcw, ChevronRight } from 'lucide-react';
import { getConfidenceLabel } from '../utils/revision.js';
import EmptyState from './EmptyState.jsx';

export default function PracticeMode({ queue, intervals, onRevise, showToast }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (!queue.length) return <EmptyState type="practice" />;

  const q = queue[index];

  const handleRevise = async () => {
    try {
      await onRevise(q._id);
      showToast('Marked as revised!');
      setRevealed(false);
      if (index >= queue.length - 1) setIndex(0);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const next = () => {
    setRevealed(false);
    setIndex((i) => (i + 1) % queue.length);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Practice Session</h2>
        <span className="text-sm text-slate-500">{index + 1} / {queue.length} due</span>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">{q.questionName}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {q.platform} · Confidence {q.confidenceLevel} ({getConfidenceLabel(q.confidenceLevel)})
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(q.tags || []).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs">{tag}</span>
              ))}
            </div>
          </div>
          {q.problemUrl && (
            <a href={q.problemUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <p className="text-sm text-amber-600 dark:text-amber-400 mt-4 font-medium">
          Solve from scratch before revealing notes
        </p>

        {revealed ? (
          <div className="mt-4 space-y-3 text-sm">
            <div><strong>Approach:</strong> {q.approach || '—'}</div>
            <div><strong>Time:</strong> {q.timeComplexity || '—'}</div>
            {q.mistakeNotes && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-red-700 dark:text-red-300">
                <strong>Mistakes:</strong> {q.mistakeNotes}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <Eye className="w-4 h-4" /> Reveal approach & notes
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleRevise}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg"
        >
          <RotateCcw className="w-4 h-4" /> Mark Revised
        </button>
        <button
          onClick={next}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Skip <ChevronRight className="w-4 h-4" />
        </button>
        {revealed && (
          <button
            onClick={() => setRevealed(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-slate-500"
          >
            <EyeOff className="w-4 h-4" /> Hide
          </button>
        )}
      </div>
    </div>
  );
}
