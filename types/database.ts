export type UserRole = 'job_seeker' | 'employer' | 'admin' | 'service_provider';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'completed' | 'withdrawn';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type ServiceRequestStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

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
  service_category_id?: string | null;
  document_number?: string | null;
  document_url: string;
  document_name?: string | null;
  file_size?: number | null;
  verification_status: VerificationStatus;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  notes?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  created_at: string;
  updated_at: string;
}

// ================================================
// SERVICE PROVIDER PLATFORM TYPES
// ================================================

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceProvider {
  id: string;
  user_id: string;
  full_name: string;
  gender: string | null;
  date_of_birth: string | null;
  phone_number: string;
  national_id: string | null;
  address: string | null;
  city: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  bio: string | null;
  years_of_experience: number;
  hourly_rate: number | null;
  currency: string;
  is_available: boolean;
  availability_hours: Record<string, string> | null;
  verification_level: number;
  is_verified: boolean;
  verification_date: string | null;
  profile_photo_url: string | null;
  id_card_photo_url: string | null;
  total_jobs_completed: number;
  average_rating: number;
  total_reviews: number;
  response_rate: number;
  is_active: boolean;
  is_suspended: boolean;
  suspension_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceProviderSkill {
  id: string;
  service_provider_id: string;
  service_category_id: string;
  service_category?: ServiceCategory;
  years_of_experience: number;
  proficiency_level: number;
  has_certificate: boolean;
  certificate_url: string | null;
  certificate_expiry: string | null;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  customer?: JobSeeker;
  service_category_id: string;
  service_category?: ServiceCategory;
  title: string;
  description: string;
  location_address: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  preferred_date: string | null;
  preferred_time: string | null;
  urgency: string;
  status: ServiceRequestStatus;
  assigned_provider_id: string | null;
  assigned_provider?: ServiceProvider;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  agreed_price: number | null;
  payment_status: PaymentStatus;
  photos: string[] | null;
  view_count: number;
  interested_providers_count: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceProviderInterest {
  id: string;
  service_request_id: string;
  service_provider_id: string;
  service_provider?: ServiceProvider;
  message: string | null;
  proposed_price: number | null;
  status: string;
  created_at: string;
}

export interface RatingReview {
  id: string;
  service_request_id: string;
  service_request?: ServiceRequest;
  service_provider_id: string;
  service_provider?: ServiceProvider;
  customer_id: string;
  customer?: JobSeeker;
  overall_rating: number;
  quality_rating: number | null;
  professionalism_rating: number | null;
  punctuality_rating: number | null;
  communication_rating: number | null;
  review_text: string | null;
  photos: string[] | null;
  provider_response: string | null;
  provider_responded_at: string | null;
  is_flagged: boolean;
  flag_reason: string | null;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProviderBadge {
  id: string;
  service_provider_id: string;
  badge_type: string;
  badge_level: number;
  earned_at: string;
}
