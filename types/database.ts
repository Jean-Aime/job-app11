export type UserRole = 'job_seeker' | 'employer' | 'admin';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'completed' | 'withdrawn';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  is_verified: boolean;
  verification_status: VerificationStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobSeeker {
  id: string;
  user_id: string;
  full_name: string;
  gender: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  phone_number: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  current_occupation: string | null;
  years_of_experience: number;
  availability: string;
  profile_photo_url: string | null;
  resume_url: string | null;
  profile_completion_score: number;
  bio: string | null;
  languages: string[];
  created_at: string;
  updated_at: string;
}

export interface Employer {
  id: string;
  user_id: string;
  company_name: string;
  registration_number: string | null;
  tax_number: string | null;
  industry: string | null;
  website: string | null;
  company_description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_person_name: string | null;
  contact_person_phone: string | null;
  contact_person_email: string | null;
  company_logo_url: string | null;
  verification_status: VerificationStatus;
  is_verified: boolean;
  employee_count: number | null;
  founded_year: number | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
}

export interface JobSeekerSkill {
  id: string;
  job_seeker_id: string;
  skill_id: string;
  skill?: Skill;
  proficiency_level: number;
  years_of_experience: number;
}

export interface Certificate {
  id: string;
  job_seeker_id: string;
  title: string;
  issuing_organization: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  certificate_url: string | null;
  credential_id: string | null;
}

export interface Experience {
  id: string;
  job_seeker_id: string;
  company_name: string;
  job_title: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  skills_used: string[] | null;
}

export interface JobCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
}

export interface Job {
  id: string;
  employer_id: string;
  employer?: Employer;
  title: string;
  description: string;
  category_id: string | null;
  category?: JobCategory;
  employment_type: EmploymentType;
  required_experience_years: number;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  location: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  is_remote: boolean;
  deadline: string | null;
  status: 'active' | 'closed' | 'draft' | 'filled';
  positions_available: number;
  positions_filled: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  required_skills?: JobSkill[];
}

export interface JobSkill {
  id: string;
  job_id: string;
  skill_id: string;
  skill?: Skill;
  is_required: boolean;
  minimum_years: number;
}

export interface Application {
  id: string;
  job_id: string;
  job?: Job;
  job_seeker_id: string;
  job_seeker?: JobSeeker;
  cover_letter: string | null;
  status: ApplicationStatus;
  match_score: number | null;
  skills_match: number | null;
  location_match: number | null;
  experience_match: number | null;
  availability_match: number | null;
  employer_notes: string | null;
  reviewed_at: string | null;
  status_updated_at: string;
  created_at: string;
}

export interface JobMatch {
  id: string;
  job_id: string;
  job?: Job;
  job_seeker_id: string;
  match_score: number;
  skills_match: number | null;
  location_match: number | null;
  experience_match: number | null;
  availability_match: number | null;
  is_viewed: boolean;
  is_applied: boolean;
  calculated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, any> | null;
  is_read: boolean;
  created_at: string;
}

export interface SavedJob {
  id: string;
  job_seeker_id: string;
  job_id: string;
  job?: Job;
  created_at: string;
}

export interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  verification_status: VerificationStatus;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  created_at: string;
}
