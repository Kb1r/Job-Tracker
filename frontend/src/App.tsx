import { useState, useEffect, useCallback } from 'react';
import type { JobApplication, JobApplicationFormData, Stats } from './types';
import { getJobs, createJob, updateJob, deleteJob, getStats } from './api/jobs';
import StatsBar from './components/StatsBar';
import JobTable from './components/JobTable';
import JobModal from './components/JobModal';

const STATUS_FILTERS = ['All', 'Applied', 'Interview', 'Offer', 'Rejected'];

const EMPTY_STATS: Stats = {
  Applied: 0, Interview: 0, Offer: 0, Rejected: 0, total: 0
};

export default function App() {
  const [jobs, setJobs]             = useState<JobApplication[]>([]);
  const [stats, setStats]           = useState<Stats>(EMPTY_STATS);
  const [filter, setFilter]         = useState('All');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [jobsData, statsData] = await Promise.all([
        getJobs(filter === 'All' ? undefined : filter),
        getStats(),
      ]);
      setJobs(jobsData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to connect to the server. Is Docker running?');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (data: JobApplicationFormData) => {
    try {
      if (editingJob) {
        await updateJob(editingJob.id, data);
      } else {
        await createJob(data);
      }
      setModalOpen(false);
      setEditingJob(null);
      fetchData();
    } catch (err) {
      alert('Failed to save. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await deleteJob(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete. Please try again.');
    }
  };

  const handleEdit = (job: JobApplication) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingJob(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Tracker</h1>
            <p className="text-gray-500 text-sm mt-1">Track your job applications in one place</p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add Application
          </button>
        </div>

        {/* Stats Bar */}
        <StatsBar stats={stats} />

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : (
          <JobTable
            jobs={jobs}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Modal */}
        {modalOpen && (
          <JobModal
            job={editingJob}
            onSave={handleSave}
            onClose={() => { setModalOpen(false); setEditingJob(null); }}
          />
        )}
      </div>
    </div>
  );
}