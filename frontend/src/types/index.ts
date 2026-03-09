export type Status = "Applied" | "Interview" | "Offer" | "Rejected";

export interface JobApplication {
  id: number;
  company_name: string;
  job_title: string;
  location: string;
  salary: string | null;
  status: Status;
  date_applied: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type JobApplicationFormData = Omit<
  JobApplication,
  "id" | "created_at" | "updated_at"
>;

export interface Stats {
  Applied: number;
  Interview: number;
  Offer: number;
  Rejected: number;
  total: number;
}
