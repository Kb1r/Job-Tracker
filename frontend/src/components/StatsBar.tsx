import type { Stats } from '../types';

interface Props {
  stats: Stats;
}

const categories = [
  { key: 'new',       label: 'New',       color: 'bg-slate-50 text-slate-700 border-slate-100' },
  { key: 'applied',   label: 'Applied',   color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { key: 'follow_up', label: 'Follow-up', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { key: 'interview', label: 'Interview', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
  { key: 'offer',     label: 'Offer',     color: 'bg-green-50 text-green-700 border-green-100' },
  { key: 'rejected',  label: 'Rejected',  color: 'bg-red-50 text-red-700 border-red-100' },
] as const;

export default function StatsBar({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
      {categories.map((cat) => (
        <div key={cat.key} className={`rounded-xl p-4 text-center border shadow-sm ${cat.color}`}>
          <div className="text-2xl font-black">{stats[cat.key as keyof Stats] || 0}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest">{cat.label}</div>
        </div>
      ))}
      <div className="bg-white text-gray-900 rounded-xl p-4 text-center border border-gray-200 shadow-sm">
        <div className="text-2xl font-black">{stats.total || 0}</div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total</div>
      </div>
    </div>
  );
}