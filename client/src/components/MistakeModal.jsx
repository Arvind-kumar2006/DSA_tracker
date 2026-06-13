import { useState, useEffect } from 'react';
import { X, AlertCircle, ExternalLink, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatDate, getConfidenceLabel } from '../utils/revision.js';
import { fetchConfidenceHistory, fetchSimilarQuestions } from '../api/questions.js';

export default function MistakeModal({ question, repeatedPatterns, onClose }) {
  const [history, setHistory] = useState([]);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    if (!question) return;
    fetchConfidenceHistory(question._id).then(setHistory).catch(() => setHistory([]));
    fetchSimilarQuestions(question._id).then(setSimilar).catch(() => setSimilar([]));
  }, [question]);

  if (!question) return null;

  const relatedPatterns = repeatedPatterns.filter((p) =>
    p.questions.includes(question.questionName)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-lg font-semibold truncate">{question.questionName}</h3>
            {question.problemUrl && (
              <a href={question.problemUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 shrink-0">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Platform</span><p className="font-medium">{question.platform}</p></div>
            <div><span className="text-slate-500">Confidence</span><p className="font-medium">{question.confidenceLevel} — {getConfidenceLabel(question.confidenceLevel)}</p></div>
            <div className="col-span-2">
              <span className="text-slate-500">Tags</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(question.tags || []).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {question.approach && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Approach</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <ReactMarkdown>{question.approach}</ReactMarkdown>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold mb-2">Mistake Notes</h4>
            {question.mistakeNotes ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <ReactMarkdown>{question.mistakeNotes}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No mistake notes recorded.</p>
            )}
          </div>

          {history.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><History className="w-4 h-4" /> Confidence History</h4>
              <div className="space-y-1">
                {history.map((h) => (
                  <div key={h._id} className="flex justify-between text-sm px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span>Level {h.confidenceLevel}</span>
                    <span className="text-slate-500">{formatDate(h.revisedAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {similar.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Similar Questions (shared tags)</h4>
              <div className="space-y-1">
                {similar.map((s) => (
                  <div key={s._id} className="text-sm px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    {s.questionName} <span className="text-slate-500">· {s.platform}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {relatedPatterns.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Repeated Mistake Patterns
              </h4>
              <div className="space-y-2">
                {relatedPatterns.map((p) => (
                  <div key={p.pattern} className="text-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p>{p.pattern}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Seen {p.count} times</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
