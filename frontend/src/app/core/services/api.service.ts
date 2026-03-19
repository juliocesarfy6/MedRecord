import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Patients
  getMyPatientProfile(): Observable<any> {
    return this.http.get(`${this.BASE}/patients/me`);
  }
  updateMyPatientProfile(data: any): Observable<any> {
    return this.http.put(`${this.BASE}/patients/me`, data);
  }
  getAllPatients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/patients`);
  }
  getPatient(id: string): Observable<any> {
    return this.http.get(`${this.BASE}/patients/${id}`);
  }

  // Medical Records
  getMyMedicalRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/medical-records/me`);
  }
  getPatientRecords(patientId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/medical-records/patient/${patientId}`);
  }
  createMedicalRecord(data: any): Observable<any> {
    return this.http.post(`${this.BASE}/medical-records`, data);
  }

  // Tokens
  generateToken(data: any): Observable<any> {
    return this.http.post(`${this.BASE}/tokens/generate`, data);
  }
  getMyTokens(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/tokens/my-tokens`);
  }
  validateToken(token: string): Observable<any> {
    return this.http.post(`${this.BASE}/tokens/validate`, { token });
  }
  revokeToken(id: string): Observable<any> {
    return this.http.delete(`${this.BASE}/tokens/${id}`);
  }

  // Audit
  getMyAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/audit/me`);
  }
  getAllAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/audit`);
  }

  // Users (Admin)
  getAllUsers(role?: string): Observable<any[]> {
    const params = role ? `?role=${role}` : '';
    return this.http.get<any[]>(`${this.BASE}/users${params}`);
  }
  toggleUserStatus(id: string): Observable<any> {
    return this.http.patch(`${this.BASE}/users/${id}/toggle-status`, {});
  }
  approveDoctor(id: string): Observable<any> {
    return this.http.patch(`${this.BASE}/users/${id}/approve`, {});
  }
  rejectDoctor(id: string): Observable<any> {
    return this.http.patch(`${this.BASE}/users/${id}/reject`, {});
  }
}
