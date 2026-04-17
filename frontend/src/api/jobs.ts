import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/jobs',
});

// Helper to convert JSON objects to FormData for file uploads
const createFormData = (data: any) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

export const getJobs = async (status?: string) => {
  const response = await api.get('/', { params: { status } });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/stats/');
  return response.data;
};

export const createJob = async (data: any) => {
  const response = await api.post('/', createFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateJob = async (id: number, data: any) => {
  const response = await api.patch(`/${id}/`, createFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/**
 * Quick Status Update
 * Matches the backend url_path='update-status'
 */
export const updateJobStatus = async (id: number, status: string) => {
  const response = await api.patch(`/${id}/update-status/`, { status });
  return response.data;
};

export const deleteJob = async (id: number) => {
  await api.delete(`/${id}/`);
};