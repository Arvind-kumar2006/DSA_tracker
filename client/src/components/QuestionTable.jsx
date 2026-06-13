import { useState } from 'react';
import { Pencil, Trash2, RotateCcw, Eye, ExternalLink, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getNextRevisionDate,
  isDueForRevision,
  getConfidenceStyle,
  getConfidenceLabel,
  formatDate,
} from '../utils/revision.js';
import EmptyState from './EmptyState.jsx';

const PAGE_SIZE = 10;

export default function QuestionTable({
  questions,
  intervals,
  sortField,
  sortDir,
  onSort,
  onEdit,
  onDelete,
  onRevise,
  onViewMistakes,
  onBulkRevise,
  onBulkDelete,
}) {
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(0);

  if (questions.length === 0) return <EmptyState type="questions" />;

  const totalPages = Math.ceil(questions.length / PAGE_SIZE);
  const paged = questions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map((q) => q._id)));
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const SortBtn = ({ field, children }) => (
    <button onClick={() => onSort(field)} className="inline-flex items-center gap-1 hover:text-blue-600">
      {children}
      <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === field ? 'text-blue-600' : ''}`} />
      {sortField === field && <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>}
    </button>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border-b border-slate-200 dark:border-slate-800 text-sm">
          <span>{selected.size} selected</span>
          <button onClick={() => onBulkRevise([...selected])} className="px-2 py-1 rounded bg-green-600 text-white text-xs">Mark Revised</button>
          <button onClick={() => onBulkDelete([...selected])} className="px-2 py-1 rounded bg-red-600 text-white text-xs">Delete</button>
          <button onClick={() => setSelected(new Set())} className="px-2 py-1 text-xs text-slate-500">Clear</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <th className="px-3 py-3 w-10">
                <input type="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll} />
              </th>
              <th className="text-left px-4 py-3 font-semibold"><SortBtn field="questionName">Question</SortBtn></th>
              <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell"><SortBtn field="platform">Platform</SortBtn></th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Tags</th>
              <th className="text-left px-4 py-3 font-semibold"><SortBtn field="confidenceLevel">Confidence</SortBtn></th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Last Revised</th>
              <th className="text-left px-4 py-3 font-semibold"><SortBtn field="nextRevision">Next Revision</SortBtn></th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((q) => {
              const nextDate = getNextRevisionDate(q, intervals);
              const due = isDueForRevision(q, intervals);
              const rowStyle = getConfidenceStyle(q.confidenceLevel);

              return (
                <tr
                  key={q._id}
                  className={`border-b border-slate-100 dark:border-slate-800 ${rowStyle} hover:brightness-95 dark:hover:brightness-110 transition-all cursor-pointer`}
                  onClick={() => onViewMistakes(q)}
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(q._id)} onChange={() => toggleOne(q._id)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium flex items-center gap-1.5">
                      {q.questionName}
                      {q.problemUrl && (
                        <a href={q.problemUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-600">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {due && <span className="inline-block mt-1 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">Revise Now</span>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">{q.platform}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(q.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 bg-white/60 dark:bg-black/20 rounded text-xs">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{q.confidenceLevel}</span>
                    <span className="text-xs text-slate-500 ml-1">({getConfidenceLabel(q.confidenceLevel)})</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">{formatDate(q.lastRevisedDate)}</td>
                  <td className="px-4 py-3">
                    <span className={due ? 'font-bold text-red-600 dark:text-red-400' : ''}>{formatDate(nextDate)}</span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onViewMistakes(q)} title="View" className="p-1.5 rounded-lg hover:bg-white/50"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => onRevise(q._id)} title="Revise" className="p-1.5 rounded-lg hover:bg-white/50 text-green-600"><RotateCcw className="w-4 h-4" /></button>
                      <button onClick={() => onEdit(q)} title="Edit" className="p-1.5 rounded-lg hover:bg-white/50 text-blue-600"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(q)} title="Delete" className="p-1.5 rounded-lg hover:bg-white/50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-sm">
          <span className="text-slate-500">Page {page + 1} of {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="p-1.5 rounded-lg border disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="p-1.5 rounded-lg border disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
