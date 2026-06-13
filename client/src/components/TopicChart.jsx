import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function TopicChart({ data }) {
  if (!data?.length) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center text-sm text-slate-500">
        No weak topic data yet
      </div>
    );
  }

  const chartData = data.slice(0, 8);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <h3 className="text-sm font-semibold mb-4">Weak Topics Breakdown</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="tag" width={90} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={i === 0 ? '#ef4444' : '#f97316'} fillOpacity={1 - i * 0.08} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
