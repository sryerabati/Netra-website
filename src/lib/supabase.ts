import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'patient' | 'nurse' | 'doctor';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Scan {
  id: string;
  patient_id: string;
  nurse_id: string;
  doctor_id: string;
  ai_prediction?: string;
  ai_confidence?: number;
  ai_details?: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'reviewed' | 'completed';
  patient_age?: number;
  patient_diabetes_duration?: number;
  created_at: string;
  updated_at: string;
}

export interface ScanImage {
  id: string;
  scan_id: string;
  image_url: string;
  eye_side: 'left' | 'right' | 'both';
  created_at: string;
}

export interface DoctorNote {
  id: string;
  scan_id: string;
  doctor_id: string;
  note_text: string;
  created_at: string;
  updated_at: string;
}
