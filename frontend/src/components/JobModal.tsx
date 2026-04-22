import { useState, useEffect, useRef } from 'react';
import type { JobApplication, JobApplicationFormData } from '../types';
import { ApiValidationError } from '../api/jobs';

interface Props {
  job?: JobApplication | null;
  onSave: (data: JobApplicationFormData) => Promise<void>;
  onClose: () => void;
}

function buildEmptyForm(): JobApplicationFormData {
  return {
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
}

export default function JobModal({ job, onSave, onClose }: Props) {
  const [form, setForm] = useState<JobApplicationFormData>(buildEmptyForm);
  const [fileError, setFileError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (job) {
      setForm({
        company_name: job.company_name,
        job_title: job.job_title,
        job_url: job.job_url ?? '',
        resume_pdf: null,
        location: job.location,
        salary: job.salary ?? '',
        status: job.status,
        date_applied: job.date_applied,
        notes: job.notes,
      });
    } else {
      setForm(buildEmptyForm());
    }
    setFileError(null);
    setUrlError(null);
    setFieldErrors({});
    setSubmitError(null);
  }, [job]);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validateUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError('File is too large (Max 5MB)');
        e.target.value = '';
        return;
      }
      if (file.type !== 'application/pdf') {
        setFileError('Only PDF files are allowed');
        e.target.value = '';
        return;
      }
      setForm(prev => ({ ...prev, resume_pdf: file }));
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, job_url: val }));
    setUrlError(val && !validateUrl(val) ? 'URL must start with http:// or https://' : null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.job_url && !validateUrl(form.job_url)) {
      setUrlError('URL must start with http:// or https://');
      return;
    }
    setFieldErrors({});
    setSubmitError(null);
    setSubmitting(true);
    try {
      await onSave(form);
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setFieldErrors(err.fieldErrors);
        setSubmitError(err.message);
      } else {
        setSubmitError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 font-medium ${fieldErrors[field] ? 'ring-2 ring-red-300' : ''}`;

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? <p className="mt-1 text-[10px] font-bold text-red-500">{fieldErrors[field]}</p> : null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 border border-gray-100">
        <h2 id="modal-title" className="text-2xl font-black mb-6 text-gray-900 uppercase tracking-tight">
          {job ? 'Update Entry' : 'New Lead'}
        </h2>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold uppercase tracking-widest">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                ref={firstInputRef}
                name="company_name"
                placeholder="Company Name"
                value={form.company_name}
                onChange={(e) => setForm(prev => ({ ...prev, company_name: e.target.value }))}
                required
                className={inputClass('company_name')}
              />
              <FieldError field="company_name" />
            </div>
            <div>
              <input
                name="job_title"
                placeholder="Position Title"
                value={form.job_title}
                onChange={(e) => setForm(prev => ({ ...prev, job_title: e.target.value }))}
                required
                className={inputClass('job_title')}
              />
              <FieldError field="job_title" />
            </div>
          </div>

          <div>
            <input
              name="job_url"
              type="url"
              placeholder="Link to posting (URL)"
              value={form.job_url ?? ''}
              onChange={handleUrlChange}
              className={`w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 font-medium ${urlError || fieldErrors.job_url ? 'ring-2 ring-red-300' : ''}`}
            />
            {urlError && <p className="mt-1 text-[10px] font-bold text-red-500">{urlError}</p>}
            <FieldError field="job_url" />
          </div>

          <div className={`p-4 rounded-xl border border-dashed transition-colors ${fileError || fieldErrors.resume_pdf ? 'bg-red-50 border-red-200' : 'bg-blue-50/30 border-blue-200'}`}>
            <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Resume / JD File (PDF, Max 5MB)</label>
            <input type="file" accept=".pdf" onChange={handleFileChange} className="w-full text-xs text-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:font-black cursor-pointer" />
            {fileError && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase">{fileError}</p>}
            <FieldError field="resume_pdf" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                name="location"
                placeholder="Remote / City"
                value={form.location}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                required
                className={inputClass('location')}
              />
              <FieldError field="location" />
            </div>
            <div>
              <input
                name="salary"
                type="number"
                placeholder="Salary expectation"
                value={form.salary ?? ''}
                onChange={(e) => setForm(prev => ({ ...prev, salary: e.target.value }))}
                className={inputClass('salary')}
              />
              <FieldError field="salary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="date"
                name="date_applied"
                value={form.date_applied}
                onChange={(e) => setForm(prev => ({ ...prev, date_applied: e.target.value }))}
                required
                className={`${inputClass('date_applied')} text-gray-500`}
              />
              <FieldError field="date_applied" />
            </div>
            <textarea
              name="notes"
              placeholder="Quick notes..."
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={1}
              className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={() => { setForm(buildEmptyForm()); onClose(); }}
              className="px-6 py-3 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 tracking-widest"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Commit Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
