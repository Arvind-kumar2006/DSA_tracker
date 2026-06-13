import { useState, useEffect } from 'react';
import { X, Download, Upload, Save } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { exportData, importData } from '../api/questions.js';

export default function SettingsModal({ onClose, onImported, showToast }) {
  const { settings, updateSettings } = useSettings();
  const [intervals, setIntervals] = useState(settings.revisionIntervals);
  const [interviewDate, setInterviewDate] = useState('');
  const [weeklyEmail, setWeeklyEmail] = useState(settings.weeklyEmailEnabled);
  const [pushEnabled, setPushEnabled] = useState(settings.pushNotificationsEnabled);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIntervals(settings.revisionIntervals);
    setInterviewDate(
      settings.interviewTargetDate
        ? new Date(settings.interviewTargetDate).toISOString().split('T')[0]
        : ''
    );
    setWeeklyEmail(settings.weeklyEmailEnabled);
    setPushEnabled(settings.pushNotificationsEnabled);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        revisionIntervals: intervals,
        interviewTargetDate: interviewDate || null,
        weeklyEmailEnabled: weeklyEmail,
        pushNotificationsEnabled: pushEnabled,
      });
      showToast('Settings saved');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dsa-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        const text = await file.text();
        const data = JSON.parse(text);
        await importData(data);
        showToast(`Imported ${data.questions?.length || 0} questions`);
        onImported?.();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Spaced Repetition Intervals (days)</h3>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <div key={level}>
                  <label className="text-xs text-slate-500 block mb-1">Lvl {level}</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={intervals[level] || ''}
                    onChange={(e) => setIntervals({ ...intervals, [level]: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1.5">Interview Target Date</label>
            <input
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={weeklyEmail} onChange={(e) => setWeeklyEmail(e.target.checked)} />
              Weekly summary email
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} />
              Browser push notifications for due questions
            </label>
          </div>

          <div className="flex gap-2">
            <button onClick={handleExport} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={handleImport} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">
              <Upload className="w-4 h-4" /> Import
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>

          <p className="text-xs text-slate-500 text-center">
            Shortcuts: <kbd className="px-1 bg-slate-100 dark:bg-slate-800 rounded">N</kbd> new question · <kbd className="px-1 bg-slate-100 dark:bg-slate-800 rounded">/</kbd> search · <kbd className="px-1 bg-slate-100 dark:bg-slate-800 rounded">Esc</kbd> close
          </p>
        </div>
      </div>
    </div>
  );
}
