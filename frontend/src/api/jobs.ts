import axios from 'axios';
import type { JobApplication, JobApplicationFormData, Stats } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const getJobs = (status?: string) =>
  api.get<JobApplication[]>('/jobs/', {
    params: status ? { status } : {},
  }).then(res => res.data);

export const createJob = (data: JobApplicationFormData) =>
  api.post<JobApplication>('/jobs/', data).then(res => res.data);

export const updateJob = (id: number, data: JobApplicationFormData) =>
  api.put<JobApplication>(`/jobs/${id}/`, data).then(res => res.data);

export const deleteJob = (id: number) =>
  api.delete(`/jobs/${id}/`);

export const getStats = () =>
  api.get<Stats>('/stats/').then(res => res.data);