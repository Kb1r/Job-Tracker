import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { JobApplication, JobApplicationFormData, Stats, Status } from './types';
import { isStatus } from './types';
import { getJobs, createJob, updateJob, deleteJob, getStats, updateJobStatus } from './api/jobs';
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
  const [error, setError]           = useState<string | null>(null);
  const [toast, setToast]           = useState<string | null>(null);
  const toastTimeoutRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [jobsData, statsData] = await Promise.all([getJobs(), getStats()]);
      setJobs(jobsData);
      setStats(statsData);
      setError(null);
    } catch {
      setError('Network error: Unable to synchronize your pipeline.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const s = job.status.trim();
      if (filter === 'All') return true;
      if (filter === 'Follow-up') return s.includes('Followed up');
      if (filter === 'Interview') return s.toLowerCase().includes('interview') || s === 'Technical Test';
      return s === filter;
    });
  }, [jobs, filter]);

  // Propagates errors to JobModal — no catch here so the modal can display field-level errors.
  const handleSave = useCallback(async (data: JobApplicationFormData) => {
    const wasEditing = !!editingJob;
    if (editingJob) {
      await updateJob(editingJob.id, data);
    } else {
      await createJob(data);
    }
    setModalOpen(false);
    setEditingJob(null);
    await fetchData();
    showToast(wasEditing ? 'Entry updated successfully' : 'New lead added to pipeline');
  }, [editingJob, fetchData, showToast]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Permanent delete? This action cannot be undone.')) return;
    try {
      await deleteJob(id);
      await fetchData();
      showToast('Application removed');
    } catch {
      showToast('Error removing entry');
    }
  };

  // Optimistic update: apply immediately, roll back if the API rejects.
  // Guard at the boundary with isStatus so the Status union is preserved without casting.
  // Race-condition safe: only rolls back if no newer change has already overwritten newStatus.
  const handleStatusChange = useCallback(async (id: number, newStatus: string) => {
    if (!isStatus(newStatus)) return;

    let oldStatus: Status | undefined;
    setJobs(prev => {
      oldStatus = prev.find(j => j.id === id)?.status;
      return prev.map(j => j.id === id ? { ...j, status: newStatus } : j);
    });

    try {
      await updateJobStatus(id, newStatus);
      const statsData = await getStats();
      setStats(statsData);
    } catch {
      setJobs(prev => prev.map(j => {
        if (j.id !== id) return j;
        if (j.status !== newStatus) return j; // a newer change already won — don't clobber it
        if (oldStatus === undefined) return j;
        return { ...j, status: oldStatus };
      }));
      showToast('Failed to update status. Please try again.');
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans selection:bg-blue-100">
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-bottom-5 font-bold text-xs uppercase tracking-widest">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Job Tracker</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">System Operational</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingJob(null); setModalOpen(true); }}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 transition-all font-black shadow-xl shadow-blue-100 text-[11px] uppercase tracking-widest active:scale-95 hover:-translate-y-1"
          >
            + Add Opportunity
          </button>
        </div>

        {stats && <StatsBar stats={stats} />}

        <div className="flex flex-wrap gap-2 mb-10 bg-white p-2 rounded-3xl border border-gray-100 shadow-sm w-fit">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === s
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                  : 'bg-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 w-full bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <JobTable
            jobs={filteredJobs}
            totalJobs={jobs.length}
            activeFilter={filter}
            onEdit={(job) => { setEditingJob(job); setModalOpen(true); }}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onClearFilter={() => setFilter('All')}
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
