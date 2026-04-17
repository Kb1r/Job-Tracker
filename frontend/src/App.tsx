import { useState, useEffect, useCallback, useMemo } from 'react';
import type { JobApplication, JobApplicationFormData, Stats } from './types';
import { getJobs, createJob, updateJob, deleteJob, getStats } from './api/jobs';
import StatsBar from './components/StatsBar';
import JobTable from './components/JobTable';
import JobModal from './components/JobModal';

const STATUS_FILTERS = ['All', 'New', 'Applied', 'Follow-up', 'Interview', 'Offer', 'Rejected'];

export default function App() {
  const [jobs, setJobs]             = useState<JobApplication[]>([]);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [filter, setFilter]         = useState('All');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [loading, setLoading]       = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [jobsData, statsData] = await Promise.all([getJobs(), getStats()]);
      setJobs(jobsData);
      setStats(statsData);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const status = job.status.trim();
      if (filter === 'All') return true;
      if (filter === 'Follow-up') return status.startsWith('Followed up');
      if (filter === 'Interview') return status.toLowerCase().includes('interview');
      return status === filter;
    });
  }, [jobs, filter]);

  const handleSave = async (data: JobApplicationFormData) => {
    try {
      editingJob ? await updateJob(editingJob.id, data) : await createJob(data);
      setModalOpen(false);
      setEditingJob(null);
      await fetchData(); // Sync state after save
    } catch (err) {
      alert('Save failed.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete?')) return;
    await deleteJob(id);
    await fetchData(); // Sync state after delete
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Job Tracker</h1>
            <p className="text-gray-500 text-sm font-medium italic">Pipeline Management</p>
          </div>
          <button
            onClick={() => { setEditingJob(null); setModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 text-sm"
          >
            + ADD APPLICATION
          </button>
        </div>

        {stats && <StatsBar stats={stats} />}

        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-fit">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                filter === s
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-300 font-bold uppercase tracking-widest">Syncing Pipeline...</div>
        ) : (
          <JobTable 
            jobs={filteredJobs} 
            onEdit={(job) => { setEditingJob(job); setModalOpen(true); }} 
            onDelete={handleDelete}
            onRefresh={fetchData} // Pass the refresh function
          />
        )}

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