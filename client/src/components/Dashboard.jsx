import { BookOpen, AlertTriangle, CheckCircle2, Target, Flame, Calendar, TrendingUp } from 'lucide-react';

export default function Dashboard({ stats }) {
  const cards = [
    { label: 'Total Questions', value: stats.total, icon: BookOpen, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50' },
    { label: 'Weak Questions', value: stats.weak, icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/50' },
    { label: 'Strong Questions', value: stats.strong, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/50' },
    { label: 'Top Weak Topic', value: stats.mostFrequentWeakTopic || '—', icon: Target, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50' },
    { label: 'Revision Streak', value: `${stats.streak || 0} days`, icon: Flame, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/50' },
    { label: 'Revised Today', value: stats.revisedToday || 0, icon: TrendingUp, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/50' },
  ];

  return (
    <div className="space-y-4">
      {stats.daysUntilInterview !== null && stats.daysUntilInterview !== undefined && (
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-4 text-white flex items-center gap-3">
          <Calendar className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-semibold">{stats.daysUntilInterview} days until interview</p>
            <p className="text-sm text-indigo-100">
              Suggested: {stats.suggestedDailyRevisions || 0} revisions per day · {stats.dueNextWeek || 0} due this week
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{label}</p>
                <p className="text-2xl font-bold mt-0.5 truncate">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
