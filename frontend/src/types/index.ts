export type Status =
  | 'New'
  | 'Applied'
  | 'Followed up (1)'
  | 'Followed up (2)'
  | 'Followed up (3)'
  | 'Followed up (4)'
  | 'Invited to first interview'
  | 'Invited to second interview'
  | 'Technical Test'
  | 'Offer'
  | 'Rejected'
  | 'Rejected after first interview'
  | 'Closed / No interest'
  | 'No response';

export const STATUS_VALUES: readonly Status[] = [
  'New', 'Applied', 'Followed up (1)', 'Followed up (2)', 'Followed up (3)', 'Followed up (4)',
  'Invited to first interview', 'Invited to second interview', 'Technical Test',
  'Offer', 'Rejected', 'Rejected after first interview', 'Closed / No interest', 'No response',
];

export function isStatus(s: string): s is Status {
  return (STATUS_VALUES as string[]).includes(s);
}

export interface JobApplication {
  id: number;
  company_name: string;
  job_title: string;
  job_url: string | null;
  resume_pdf: string | null;
  location: string;
  salary: string | null;
  status: Status;
  date_applied: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplicationFormData {
  company_name: string;
  job_title: string;
  job_url: string;
  resume_pdf: File | null;
  location: string;
  salary: string;
  status: Status;
  date_applied: string;
  notes: string;
}

export interface Stats {
  new: number;
  applied: number;
  follow_up: number;
  interview: number;
  offer: number;
  rejected: number;
  total: number;
}
