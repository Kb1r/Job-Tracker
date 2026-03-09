import { useState, useEffect } from 'react';
import type { JobApplication, JobApplicationFormData, Status } from '../types';

interface Props {
  job?: JobApplication | null;
  onSave: (data: JobApplicationFormData) => void;
  onClose: () => void;
}

const EMPTY_FORM: JobApplicationFormData = {
  company_name: '',
  job_title: '',
  location: '',
  salary: null,
  status: 'Applied',
  date_applied: new Date().toISOString().split('T')[0],
  notes: '',
};

export default function JobModal({ job, onSave, onClose }: Props) {
  const [form, setForm] = useState<JobApplicationFormData>(EMPTY_FORM);

  useEffect(() => {
    if (job) {
      const { id, created_at, updated_at, ...rest } = job;
      setForm(rest);
    } else {
      setForm(EMPTY_FORM);
    }
  }, [job]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value === '' ? null : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-xl font-bold mb-4">
          {job ? 'Edit Application' : 'Add Application'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company *
              </label>
              <input
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                name="job_title"
                value={form.job_title}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary (optional)
              </label>
              <input
                name="salary"
                value={form.salary ?? ''}
                onChange={handleChange}
                placeholder="e.g. 75000"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(['Applied', 'Interview', 'Offer', 'Rejected'] as Status[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Applied *
              </label>
              <input
                type="date"
                name="date_applied"
                value={form.date_applied}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {job ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}