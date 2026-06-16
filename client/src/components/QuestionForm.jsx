import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const emptyForm = {
  questionName: '',
  problemUrl: '',
  platform: '',
  tags: [],
  solveStatus: 'Solved Alone',
  keyInsight: '',
  approach: '',
  timeComplexity: '',
  confidenceLevel: 3,
  lastRevisedDate: new Date().toISOString().split('T')[0],
  mistakeNotes: '',
  customRevisionDays: '',
  customReminderDate: '',
};

export default function QuestionForm({ onSubmit, editing, onCancel, platforms, tags, solveStatuses }) {
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (platforms?.length && !form.platform) {
      setForm((f) => ({ ...f, platform: platforms[0] }));
    }
  }, [platforms]);

  useEffect(() => {
    if (editing) {
      setForm({
        questionName: editing.questionName,
        problemUrl: editing.problemUrl || '',
        platform: editing.platform,
        tags: editing.tags || [],
        solveStatus: editing.solveStatus || 'Solved Alone',
        keyInsight: editing.keyInsight || '',
        approach: editing.approach || '',
        timeComplexity: editing.timeComplexity || '',
        confidenceLevel: editing.confidenceLevel,
        lastRevisedDate: new Date(editing.lastRevisedDate).toISOString().split('T')[0],
        mistakeNotes: editing.mistakeNotes || '',
        customRevisionDays: editing.customRevisionDays || '',
        customReminderDate: editing.customReminderDate
          ? new Date(editing.customReminderDate).toISOString().split('T')[0]
          : '',
      });
    } else {
      setForm({ ...emptyForm, platform: platforms?.[0] || '' });
    }
  }, [editing, platforms]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const addCustomTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      confidenceLevel: Number(form.confidenceLevel),
      lastRevisedDate: new Date(form.lastRevisedDate).toISOString(),
      customRevisionDays: form.customRevisionDays ? Number(form.customRevisionDays) : null,
      customReminderDate: form.customReminderDate
        ? new Date(form.customReminderDate).toISOString()
        : null,
    });
    if (!editing) {
      setForm({ ...emptyForm, platform: platforms?.[0] || '' });
      setTagInput('');
    }
  };

  const filteredSuggestions = (tags || []).filter(
    (t) => t.toLowerCase().includes(tagInput.toLowerCase()) && !form.tags.includes(t)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-lg font-semibold">{editing ? 'Edit Question' : 'Add New Question'}</h2>
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Question Name</label>
              <input type="text" name="questionName" value={form.questionName} onChange={handleChange} required placeholder="e.g. Two Sum" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Problem URL</label>
              <input type="url" name="problemUrl" value={form.problemUrl} onChange={handleChange} placeholder="https://leetcode.com/..." className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Platform</label>
              <select name="platform" value={form.platform} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                {(platforms || []).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Time Complexity</label>
              <input type="text" name="timeComplexity" value={form.timeComplexity} onChange={handleChange} placeholder="e.g. O(n log n)" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Solve Status</label>
              <select name="solveStatus" value={form.solveStatus} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                {(solveStatuses || ['Solved Alone', 'Solved With Hint', 'Solved After Solution']).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confidence Level</label>
              <select name="confidenceLevel" value={form.confidenceLevel} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} — {n <= 2 ? 'Weak' : n === 3 ? 'Medium' : 'Strong'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Last Revised Date</label>
              <input type="date" name="lastRevisedDate" value={form.lastRevisedDate} onChange={handleChange} required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Custom Revision Days</label>
              <input type="number" name="customRevisionDays" value={form.customRevisionDays} onChange={handleChange} min={1} max={365} placeholder="Override interval" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Remind Me On (override)</label>
              <input type="date" name="customReminderDate" value={form.customReminderDate} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Key Insight</label>
            <input
              type="text"
              name="keyInsight"
              value={form.keyInsight}
              onChange={handleChange}
              placeholder="e.g. Use hash map to track complements in one pass"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Topic Tags</label>
            {tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 max-h-24 overflow-y-auto">
                {tags.map((tag) => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-2.5 py-1 rounded-full text-xs font-medium ${form.tags.includes(tag) ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())} placeholder="Type to autocomplete..." list="tag-suggestions" className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <datalist id="tag-suggestions">{filteredSuggestions.map((t) => <option key={t} value={t} />)}</datalist>
              <button type="button" onClick={addCustomTag} className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium">Add</button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                    {tag}
                    <button type="button" onClick={() => toggleTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium">Approach (Markdown)</label>
              <button type="button" onClick={() => setShowPreview(!showPreview)} className="text-xs text-blue-600">{showPreview ? 'Edit' : 'Preview'}</button>
            </div>
            {showPreview ? (
              <div className="prose prose-sm dark:prose-invert max-w-none p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 min-h-[60px]">
                <ReactMarkdown>{form.approach || '_No approach yet_'}</ReactMarkdown>
              </div>
            ) : (
              <textarea name="approach" value={form.approach} onChange={handleChange} rows={3} placeholder="Brief approach... supports **markdown**" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Mistake Notes (Markdown)</label>
            <textarea name="mistakeNotes" value={form.mistakeNotes} onChange={handleChange} rows={2} placeholder="What mistakes did you make?" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>

          <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm">
            <Save className="w-4 h-4" />
            {editing ? 'Update' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
