const API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000/api';

interface AuthTokens {
  access: string;
  refresh: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: 'patient' | 'nurse' | 'doctor' | 'admin';
  full_name: string;
  phone?: string;
}

interface Scan {
  id: number;
  patient: User;
  nurse: User;
  doctor: User;
  left_eye_prediction: string | null;
  left_eye_prediction_class: number | null;
  right_eye_prediction: string | null;
  right_eye_prediction_class: number | null;
  ai_details: any;
  priority: string;
  status: string;
  patient_age?: number;
  patient_diabetes_duration?: number;
  created_at: string;
  updated_at: string;
  images: ScanImage[];
  doctor_notes: DoctorNote[];
}

interface ScanImage {
  id: number;
  image: string;
  image_url: string;
  image_filename: string;
  eye_side: string;
  created_at: string;
}

interface DoctorNote {
  id: number;
  doctor: User;
  note_text: string;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: number;
  patient: User;
  doctor: User;
  is_active: boolean;
  created_at: string;
}

class DjangoAPI {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  private getAuthHeaderMultipart(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async register(username: string, email: string, password: string, full_name: string, role: string) {
    const response = await fetch(`${API_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, full_name, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    return data.user;
  }

  async login(username: string, password: string) {
    const response = await fetch(`${API_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    return data.user;
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_URL}/me/`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    return response.json();
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const response = await fetch(`${API_URL}/users/${role}/`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get ${role}s`);
    }

    return response.json();
  }

  async uploadScan(formData: FormData): Promise<Scan> {
    const response = await fetch(`${API_URL}/upload-scan/`, {
      method: 'POST',
      headers: this.getAuthHeaderMultipart(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.data;
  }

  async getMyScans(): Promise<Scan[]> {
    const response = await fetch(`${API_URL}/my-scans/`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get scans');
    }

    return response.json();
  }

  async getNurseScans(): Promise<Scan[]> {
    const response = await fetch(`${API_URL}/nurse-scans/`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get scans');
    }

    return response.json();
  }

  async getAllScans(priority?: string, status?: string): Promise<Scan[]> {
    const params = new URLSearchParams();
    if (priority) params.append('priority', priority);
    if (status) params.append('status', status);

    const url = `${API_URL}/all-scans/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get scans');
    }

    return response.json();
  }

  async getScanDetail(scanId: number): Promise<Scan> {
    const response = await fetch(`${API_URL}/scans/${scanId}/`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get scan');
    }

    return response.json();
  }

  async updateScan(scanId: number, priority?: string, status?: string): Promise<Scan> {
    const response = await fetch(`${API_URL}/scans/${scanId}/update/`, {
      method: 'PATCH',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ priority, status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Update failed');
    }

    const data = await response.json();
    return data.data;
  }

  async addDoctorNote(scanId: number, note_text: string): Promise<DoctorNote> {
    const response = await fetch(`${API_URL}/scans/${scanId}/notes/`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ note_text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add note');
    }

    const data = await response.json();
    return data.data;
  }

  async getScanStats() {
    const response = await fetch(`${API_URL}/scan-stats/`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get stats');
    }

    return response.json();
  }

  async getSubscriptions(): Promise<Subscription[]> {
    const response = await fetch(`${API_URL}/subscriptions/`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get subscriptions');
    }

    return response.json();
  }

  async subscribeToDoctor(doctorId: number): Promise<Subscription> {
    const response = await fetch(`${API_URL}/subscribe/`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ doctor_id: doctorId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Subscription failed');
    }

    const data = await response.json();
    return data.data;
  }

  async unsubscribeFromDoctor(subscriptionId: number): Promise<void> {
    const response = await fetch(`${API_URL}/subscriptions/${subscriptionId}/unsubscribe/`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Unsubscribe failed');
    }
  }

  async getDoctorPatients(): Promise<User[]> {
    const response = await fetch(`${API_URL}/doctor/patients/`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get patients');
    }

    return response.json();
  }

  async getPatientHistory(patientId: number): Promise<Scan[]> {
    const response = await fetch(`${API_URL}/doctor/patients/${patientId}/history/`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get patient history');
    }

    return response.json();
  }

  async getAdminScans(): Promise<Scan[]> {
    const response = await fetch(`${API_URL}/admin/scans/`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get admin scans');
    }

    return response.json();
  }

  async deleteScan(scanId: number): Promise<void> {
    const response = await fetch(`${API_URL}/admin/scans/${scanId}/delete/`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }
  }

  async getAdminStats(): Promise<any> {
    const response = await fetch(`${API_URL}/admin/stats/`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to get admin stats');
    }

    return response.json();
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

export const djangoApi = new DjangoAPI();
export type { User, Scan, ScanImage, DoctorNote, Subscription };
