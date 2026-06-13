import { LayoutDashboard, List, Dumbbell, Settings } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'questions', label: 'Questions', icon: List },
  { id: 'practice', label: 'Practice', icon: Dumbbell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function MobileNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur border-t border-slate-200 dark:border-slate-800">
      <div className="flex justify-around py-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors ${
              active === id ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
