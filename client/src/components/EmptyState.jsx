import { Inbox, CalendarCheck, BookOpen } from 'lucide-react';

const configs = {
  questions: {
    icon: Inbox,
    title: 'No questions yet',
    description: 'Add your first solved problem to start tracking revisions.',
  },
  due: {
    icon: CalendarCheck,
    title: 'All caught up!',
    description: 'No questions due for revision today. Great job staying on track.',
  },
  practice: {
    icon: BookOpen,
    title: 'Nothing to practice',
    description: 'All due questions are cleared. Add more or check back tomorrow.',
  },
};

export default function EmptyState({ type = 'questions' }) {
  const { icon: Icon, title, description } = configs[type] || configs.questions;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
      <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
    </div>
  );
}
