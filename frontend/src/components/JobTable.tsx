import type { JobApplication, Status } from '../types';

interface Props {
  jobs: JobApplication[];
  onEdit: (job: JobApplication) => void;
  onDelete: (id: number) => void;
}

const statusColors: Record<Status, string> = {
  Applied:   'bg-blue-100 text-blue-700',
  Interview: 'bg-yellow-100 text-yellow-700',
  Offer:     'bg-green-100 text-green-700',
  Rejected:  'bg-red-100 text-red-700',
};

export default function JobTable({ jobs, onEdit, onDelete }: Props) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-4">📋</div>
        <div className="text-lg font-medium">No applications yet</div>
        <div className="text-sm">Click "Add Application" to get started</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">Company</th>
            <th className="px-4 py-3 text-left">Job Title</th>
            <th className="px-4 py-3 text-left">Location</th>
            <th className="px-4 py-3 text-left">Salary</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Date Applied</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {jobs.map(job => (
            <tr key={job.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium">{job.company_name}</td>
              <td className="px-4 py-3 text-gray-600">{job.job_title}</td>
              <td className="px-4 py-3 text-gray-600">{job.location}</td>
              <td className="px-4 py-3 text-gray-600">
                {job.salary ? `£${Number(job.salary).toLocaleString()}` : '—'}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                  {job.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">{job.date_applied}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(job)}
                    className="px-3 py-1 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(job.id)}
                    className="px-3 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}