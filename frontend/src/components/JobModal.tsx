import { useState, useEffect } from 'react';
import type { JobApplication } from '../types';

interface Props {
  job?: JobApplication | null;
  onSave: (data: any) => void;
  onClose: () => void;
}

const EMPTY_FORM: any = {
  company_name: '',
  job_title: '',
  job_url: '',
  resume_pdf: null,
  location: '',
  salary: '',
  status: 'New',
  date_applied: new Date().toISOString().split('T')[0],
  notes: '',
};

export default function JobModal({ job, onSave, onClose }: Props) {
  const [form, setForm] = useState<any>(EMPTY_FORM);

  useEffect(() => {
    if (job) {
      const { id, created_at, updated_at, resume_pdf, ...rest } = job;
      setForm({ ...rest, resume_pdf: null });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [job]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 border border-gray-100 animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-black mb-6 text-gray-900 uppercase tracking-tight">
          {job ? 'Update Entry' : 'New Lead'}
        </h2>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <input 
              name="company_name" 
              placeholder="Company Name" 
              value={form.company_name} 
              onChange={(e) => setForm({...form, company_name: e.target.value})} 
              required 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 font-medium" 
            />
            <input 
              name="job_title" 
              placeholder="Position Title" 
              value={form.job_title} 
              onChange={(e) => setForm({...form, job_title: e.target.value})} 
              required 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 font-medium" 
            />
          </div>

          {/* ADDED URL LINK SECTION BACK HERE */}
          <input 
            name="job_url" 
            type="url"
            placeholder="Link to posting (URL)" 
            value={form.job_url ?? ''} 
            onChange={(e) => setForm({...form, job_url: e.target.value})} 
            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 font-medium" 
          />

          <div className="bg-blue-50/30 p-4 rounded-xl border border-dashed border-blue-200">
            <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Resume / JD File</label>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setForm((prev: any) => ({ ...prev, resume_pdf: file }));
              }} 
              className="w-full text-xs text-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:font-black cursor-pointer" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input 
              name="location" 
              placeholder="Remote / City" 
              value={form.location} 
              onChange={(e) => setForm({...form, location: e.target.value})} 
              required 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 font-medium" 
            />
            <input 
              name="salary" 
              type="number" 
              placeholder="Salary expectation" 
              value={form.salary ?? ''} 
              onChange={(e) => setForm({...form, salary: e.target.value})} 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 font-medium" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input 
              type="date" 
              name="date_applied" 
              value={form.date_applied} 
              onChange={(e) => setForm({...form, date_applied: e.target.value})} 
              required 
              className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 font-medium text-gray-500" 
            />
            <textarea 
              name="notes" 
              placeholder="Quick notes..." 
              value={form.notes} 
              onChange={(e) => setForm({...form, notes: e.target.value})} 
              rows={1} 
              className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 font-medium" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 tracking-widest"
            >
              Close
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
            >
              Commit Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}