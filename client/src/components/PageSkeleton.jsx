export default function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="h-20 bg-sky-400/30 rounded-xl" />
      <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  );
}
