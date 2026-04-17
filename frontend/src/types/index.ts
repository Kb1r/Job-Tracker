export type Status = 
  | "New" | "Applied" 
  | "Followed up (1)" | "Followed up (2)" | "Followed up (3)" | "Followed up (4)"
  | "Invited to first interview" | "Invited to second interview"
  | "Offer" | "Rejected" | "Rejected after first interview";

export interface JobApplication {
  id: number;
  company_name: string;
  job_title: string;
  job_url: string | null; // Added
  location: string;
  salary: string | null;
  status: Status;
  date_applied: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type JobApplicationFormData = Omit<JobApplication, "id" | "created_at" | "updated_at">;

export interface Stats {
  New: number;
  Applied: number;
  Interview: number;
  Offer: number;
  Rejected: number;
  total: number;
}