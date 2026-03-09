import type { Stats } from '../types';

interface Props {
  stats: Stats;
}

const statusColors: Record<string, string> = {
  Applied:   'bg-blue-100 text-blue-800',
  Interview: 'bg-yellow-100 text-yellow-800',
  Offer:     'bg-green-100 text-green-800',
  Rejected:  'bg-red-100 text-red-800',
};

export default function StatsBar({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {(['Applied', 'Interview', 'Offer', 'Rejected'] as const).map(status => (
        <div key={status} className={`rounded-lg p-4 text-center ${statusColors[status]}`}>
          <div className="text-2xl font-bold">{stats[status]}</div>
          <div className="text-sm font-medium">{status}</div>
        </div>
      ))}
      <div className="bg-gray-100 text-gray-800 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold">{stats.total}</div>
        <div className="text-sm font-medium">Total</div>
      </div>
    </div>
  );
}