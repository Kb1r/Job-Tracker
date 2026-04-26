import axios from 'axios';
import { ApiValidationError } from './jobs';
import type { AxiosError } from 'axios';

const SERVER_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000';

const authApi = axios.create({
  baseURL: `${SERVER_URL}/api/auth`,
});

authApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 400 && error.response.data) {
      const data = error.response.data as Record<string, string | string[]>;
      const fieldErrors: Record<string, string> = {};
      let message = 'Please correct the errors below.';

      for (const [key, val] of Object.entries(data)) {
        if (key === 'detail' || key === 'error' || key === 'non_field_errors') {
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

export interface AuthResponse {
  token: string;
  firstName: string;
}

interface AuthApiPayload {
  token: string;
  first_name: string;
}

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await authApi.post<AuthApiPayload>('/login/', { email, password });
  return { token: response.data.token, firstName: response.data.first_name };
};

export const registerUser = async (email: string, password: string, firstName: string): Promise<AuthResponse> => {
  const response = await authApi.post<AuthApiPayload>('/register/', {
    email,
    password,
    first_name: firstName,
  });
  return { token: response.data.token, firstName: response.data.first_name };
};
