import type { JobApplication } from '../types';

interface Props {
  jobs: JobApplication[];
  totalJobs: number;
  activeFilter: string;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: string) => Promise<void>;
  onClearFilter: () => void;
}

const STATUS_OPTIONS = [
  'New', 'Applied', 'Followed up (1)', 'Followed up (2)', 'Followed up (3)', 'Followed up (4)',
  'Invited to first interview', 'Invited to second interview', 'Technical Test',
  'Offer', 'Rejected', 'Rejected after first interview', 'Closed / No interest', 'No response',
];

export default function JobTable({ jobs, totalJobs, activeFilter, onEdit, onDelete, onStatusChange, onClearFilter }: Props) {

  if (totalJobs === 0) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h3 className="text-lg font-black text-gray-900 uppercase">Ready to hunt?</h3>
        <p className="text-gray-400 text-sm mt-1">Add your first job application to start tracking.</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-md font-black text-gray-400 uppercase">No results for "{activeFilter}"</h3>
        <button onClick={onClearFilter} className="mt-4 text-blue-600 font-bold text-xs uppercase tracking-widest">Clear Filters</button>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'new') return 'bg-slate-50 text-slate-700';
    if (s === 'applied') return 'bg-blue-50 text-blue-700';
    if (s.includes('followed up')) return 'bg-emerald-50 text-emerald-700';
    if (s.includes('interview') || s.includes('test')) return 'bg-yellow-50 text-yellow-700';
    if (s === 'offer') return 'bg-green-50 text-green-700';
    if (s.includes('rejected') || s.includes('closed')) return 'bg-red-50 text-red-700';
    return 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-left">Company</th>
            <th className="px-6 py-4 text-left">URL</th>
            <th className="px-6 py-4 text-left">PDF</th>
            <th className="px-6 py-4 text-left">Location</th>
            <th className="px-6 py-4 text-left">Status</th>
            <th className="px-6 py-4 text-left">Date</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {jobs.map(job => (
            <tr key={job.id} className="hover:bg-gray-50/30 transition-colors">
              <td className="px-6 py-5 font-bold text-gray-900">{job.company_name}</td>
              <td className="px-6 py-5">
                {job.job_url ? (
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-bold hover:underline italic"
                  >
                    Link ↗
                  </a>
                ) : (
                  <span className="text-gray-200">—</span>
                )}
              </td>
              <td className="px-6 py-5">
                {job.resume_pdf ? (
                  <a
                    href={job.resume_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase border border-emerald-100"
                  >
                    View PDF
                  </a>
                ) : (
                  <span className="text-gray-300 italic text-xs">None</span>
                )}
              </td>
              <td className="px-6 py-5 text-gray-500 font-medium">{job.location}</td>
              <td className="px-6 py-5">
                <select
                  value={job.status}
                  onChange={(e) => { void onStatusChange(job.id, e.target.value); }}
                  className={`appearance-none cursor-pointer border-none rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-tight focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors ${getStatusStyle(job.status)}`}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt} className="bg-white text-gray-900 font-bold uppercase">{opt}</option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-5 text-gray-400 text-xs font-bold">{job.date_applied}</td>
              <td className="px-6 py-5 text-center">
                <div className="flex justify-center gap-3">
                  <button onClick={() => onEdit(job)} className="text-[11px] font-black uppercase text-blue-600 hover:text-blue-800">Edit</button>
                  <button onClick={() => onDelete(job.id)} className="text-[11px] font-black uppercase text-red-400 hover:text-red-600">Del</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
