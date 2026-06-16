import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Moon, Sun, Code2, LogOut } from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';
import { useSettings } from './context/SettingsContext.jsx';
import Dashboard from './components/Dashboard';
import QuestionForm from './components/QuestionForm';
import SearchFilter from './components/SearchFilter';
import DueRevisionCard from './components/DueRevisionCard';
import QuestionTable from './components/QuestionTable';
import MistakeModal from './components/MistakeModal';
import Toast from './components/Toast';
import TopicChart from './components/TopicChart';
import PracticeMode from './components/PracticeMode';
import SettingsModal from './components/SettingsModal';
import MobileNav from './components/MobileNav';
import PageSkeleton from './components/PageSkeleton';
import EmptyState from './components/EmptyState';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePushNotifications } from './hooks/usePushNotifications';
import {
  fetchQuestions,
  fetchStats,
  fetchMistakePatterns,
  fetchPracticeQueue,
  createQuestion,
  updateQuestion,
  markAsRevised,
  deleteQuestion,
  restoreQuestion,
  bulkRevise,
  bulkDelete,
} from './api/questions';
import { getNextRevisionDate, isDueForRevision } from './utils/revision';

export default function TrackerApp() {
  const { user, logout } = useAuth();
  const { settings, loaded: settingsLoaded, loadSettings } = useSettings();
  const searchRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({});
  const [mistakePatterns, setMistakePatterns] = useState([]);
  const [practiceQueue, setPracticeQueue] = useState([]);
  const [editing, setEditing] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored === null ? true : stored === 'true';
  });
  const [sortField, setSortField] = useState('nextRevision');
  const [sortDir, setSortDir] = useState('asc');
  const [filters, setFilters] = useState({ search: '', confidence: '', platform: '', tag: '', dueOnly: false });
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const intervals = settings.revisionIntervals;

  const showToast = useCallback((message, type = 'success', undoData = null) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, undoData }]);
    const duration = undoData ? 8000 : 3000;
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const loadData = useCallback(async () => {
    try {
      const [qs, st, mp, pq] = await Promise.all([
        fetchQuestions(),
        fetchStats(),
        fetchMistakePatterns(),
        fetchPracticeQueue(),
      ]);
      setQuestions(qs);
      setStats(st);
      setMistakePatterns(mp);
      setPracticeQueue(pq);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSettings().then(() => loadData());
  }, [loadSettings, loadData]);

  const dueRevisionCount = stats.dueToday ?? 0;

  usePushNotifications({
    enabled: settings.pushNotificationsEnabled,
    dueCount: dueRevisionCount,
    settingsLoaded,
  });

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredQuestions = useMemo(() => {
    let result = [...questions];

    if (filters.dueOnly) result = result.filter((q) => isDueForRevision(q, intervals));
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter((q) => q.questionName.toLowerCase().includes(s));
    }
    if (filters.confidence === 'weak') result = result.filter((q) => q.confidenceLevel <= 2);
    if (filters.confidence === 'medium') result = result.filter((q) => q.confidenceLevel === 3);
    if (filters.confidence === 'strong') result = result.filter((q) => q.confidenceLevel >= 4);
    if (filters.platform) result = result.filter((q) => q.platform === filters.platform);
    if (filters.tag) result = result.filter((q) => (q.tags || []).includes(filters.tag));

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'questionName') cmp = a.questionName.localeCompare(b.questionName);
      else if (sortField === 'platform') cmp = a.platform.localeCompare(b.platform);
      else if (sortField === 'confidenceLevel') cmp = a.confidenceLevel - b.confidenceLevel;
      else if (sortField === 'nextRevision') {
        cmp = getNextRevisionDate(a, intervals) - getNextRevisionDate(b, intervals);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [questions, filters, sortField, sortDir, intervals]);

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await updateQuestion(editing._id, data);
        setEditing(null);
        showToast('Question updated successfully');
      } else {
        await createQuestion(data);
        showToast('Question added successfully');
      }
      setShowForm(false);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRevise = async (id) => {
    await markAsRevised(id);
    await loadData();
    showToast('Marked as revised today');
  };

  const handleDelete = async (question) => {
    try {
      const deleted = await deleteQuestion(question._id);
      await loadData();
      showToast('Question deleted successfully', 'success', deleted.question || question);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUndo = async (toast) => {
    if (!toast.undoData) return;
    try {
      await restoreQuestion(toast.undoData);
      removeToast(toast.id);
      await loadData();
      showToast('Question restored');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleBulkRevise = async (ids) => {
    try {
      await bulkRevise(ids);
      await loadData();
      showToast(`Marked ${ids.length} questions as revised`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await bulkDelete(ids);
      await loadData();
      showToast(`Deleted ${ids.length} questions`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  useKeyboardShortcuts({
    onNew: () => { setEditing(null); setShowForm(true); },
    onSearch: () => searchRef.current?.focusSearch(),
    onEscape: () => { setShowForm(false); setShowSettings(false); setSelectedQuestion(null); },
    enabled: !showForm && !showSettings,
  });

  const questionsSection = (
    <>
      <DueRevisionCard
        count={dueRevisionCount}
        active={filters.dueOnly}
        onClick={() => setFilters((f) => ({ ...f, dueOnly: !f.dueOnly }))}
      />
      <SearchFilter
        ref={searchRef}
        filters={filters}
        onChange={setFilters}
        onAddQuestion={() => { setEditing(null); setShowForm(true); }}
        platforms={settings.platforms}
        tags={settings.tags}
      />
      {filters.dueOnly && filteredQuestions.length === 0 ? (
        <EmptyState type="due" />
      ) : (
        <QuestionTable
          questions={filteredQuestions}
          intervals={intervals}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onEdit={(q) => { setEditing(q); setShowForm(true); }}
          onDelete={handleDelete}
          onRevise={handleRevise}
          onViewMistakes={setSelectedQuestion}
          onBulkRevise={handleBulkRevise}
          onBulkDelete={handleBulkDelete}
        />
      )}
    </>
  );

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <>
          <Dashboard stats={stats} />
          {questionsSection}
          <TopicChart data={stats.topicWeakness} />
        </>
      );
    }
    if (activeTab === 'practice') {
      return (
        <PracticeMode
          queue={practiceQueue}
          intervals={intervals}
          onRevise={handleRevise}
          showToast={showToast}
        />
      );
    }
    if (activeTab === 'settings') {
      return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center">
          <p className="text-slate-500 mb-4">Manage intervals, interview date, export/import, and notifications</p>
          <button onClick={() => setShowSettings(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
            Open Settings
          </button>
        </div>
      );
    }
    return questionsSection;
  };

  return (
    <div className="min-h-screen pb-20 md:pb-6">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg"><Code2 className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-xl font-bold">DSA Revision Tracker</h1>
              <p className="text-xs text-slate-500">Hi, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(true)} className="hidden md:block px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
              Settings
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={logout} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {loading || !settingsLoaded ? <PageSkeleton /> : renderContent()}
      </main>

      <MobileNav active={activeTab} onChange={setActiveTab} />

      {showForm && (
        <QuestionForm
          onSubmit={handleSubmit}
          editing={editing}
          onCancel={() => { setEditing(null); setShowForm(false); }}
          platforms={settings.platforms}
          tags={settings.tags}
          solveStatuses={settings.solveStatuses}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onImported={loadData}
          showToast={showToast}
        />
      )}

      <MistakeModal
        question={selectedQuestion}
        repeatedPatterns={mistakePatterns}
        onClose={() => setSelectedQuestion(null)}
      />

      <Toast toasts={toasts} onRemove={removeToast} onUndo={handleUndo} />
    </div>
  );
}
