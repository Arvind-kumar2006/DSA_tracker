import { useRef, forwardRef, useImperativeHandle } from 'react';
import { Search, Filter, Plus } from 'lucide-react';

const SearchFilter = forwardRef(function SearchFilter(
  { filters, onChange, onAddQuestion, platforms, tags },
  ref
) {
  const searchRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focusSearch: () => searchRef.current?.focus(),
  }));

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-semibold">Search & Filter</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by name..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <select
          value={filters.confidence}
          onChange={(e) => handleChange('confidence', e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Confidence</option>
          <option value="weak">Weak (1-2)</option>
          <option value="medium">Medium (3)</option>
          <option value="strong">Strong (4-5)</option>
        </select>

        <select
          value={filters.platform}
          onChange={(e) => handleChange('platform', e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Platforms</option>
          {(platforms || []).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={filters.tag}
          onChange={(e) => handleChange('tag', e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Tags</option>
          {(tags || []).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <button
          onClick={onAddQuestion}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm sm:col-span-2 lg:col-span-1"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>
    </div>
  );
});

export default SearchFilter;
