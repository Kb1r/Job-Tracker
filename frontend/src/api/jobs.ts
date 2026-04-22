import axios, { AxiosError } from 'axios';
import type { JobApplication, JobApplicationFormData, Stats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/jobs';

export class ApiValidationError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiValidationError';
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 400 && error.response.data) {
      const data = error.response.data as Record<string, string | string[]>;
      const fieldErrors: Record<string, string> = {};
      let message = 'Please correct the errors below.';

      for (const [key, val] of Object.entries(data)) {
        if (key === 'detail' || key === 'error') {
          message = Array.isArray(val) ? val[0] : val;
        } else if (Array.isArray(val) && val.length > 0) {
          fieldErrors[key] = val[0];
        }
      }

      return Promise.reject(new ApiValidationError(message, fieldErrors));
    }
    return Promise.reject(error);
  }
);

const createFormData = (data: JobApplicationFormData): FormData => {
  const formData = new FormData();
  (Object.keys(data) as (keyof JobApplicationFormData)[]).forEach(key => {
    const val = data[key];
    if (key === 'resume_pdf') {
      // Skip null — don't overwrite an existing file when the user didn't pick a new one.
      if (val !== null) {
        formData.append(key, val as Blob);
      }
    } else {
      // Always send text fields, even when empty — empty string means "clear this field".
      if (val !== null && val !== undefined) {
        formData.append(key, val as string);
      }
    }
  });
  return formData;
};

export const getJobs = async (): Promise<JobApplication[]> => {
  const response = await api.get<JobApplication[]>('/');
  return response.data;
};

export const getStats = async (): Promise<Stats> => {
  const response = await api.get<Stats>('/stats/');
  return response.data;
};

export const createJob = async (data: JobApplicationFormData): Promise<JobApplication> => {
  const response = await api.post<JobApplication>('/', createFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateJob = async (id: number, data: JobApplicationFormData): Promise<JobApplication> => {
  const response = await api.patch<JobApplication>(`/${id}/`, createFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateJobStatus = async (id: number, status: string): Promise<void> => {
  await api.patch(`/${id}/update-status/`, { status });
};

export const deleteJob = async (id: number): Promise<void> => {
  await api.delete(`/${id}/`);
};
