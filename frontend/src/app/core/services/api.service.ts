import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE = 'http://localhost:3000/api';
  private readonly REQUEST_TIMEOUT = 6000;

  constructor(private http: HttpClient) { }

  private withTimeout<T>(request: Observable<T>): Observable<T> {
    return request.pipe(timeout(this.REQUEST_TIMEOUT));
  }

  // Patients
  getMyPatientProfile(): Observable<any> {
    return this.withTimeout(this.http.get(`${this.BASE}/patients/me`));
  }
  updateMyPatientProfile(data: any): Observable<any> {
    return this.withTimeout(this.http.put(`${this.BASE}/patients/me`, data));
  }
  getAllPatients(): Observable<any[]> {
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/patients`));
  }
  getAuthorizedPatients(): Observable<any[]> {
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/patients/authorized`));
  }
  getPatient(id: string): Observable<any> {
    return this.withTimeout(this.http.get(`${this.BASE}/patients/${id}`));
  }
  // Enviar los datos del formulario al backend para crear un paciente
  createPatient(patientData: any) {
    return this.withTimeout(this.http.post<any>(`${this.BASE}/patients`, patientData));
  }

  // Medical Records
  getMyMedicalRecords(): Observable<any[]> {
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/medical-records/me`));
  }
  getPatientRecords(patientId: string): Observable<any[]> {
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/medical-records/patient/${patientId}`));
  }
  createMedicalRecord(data: any): Observable<any> {
    return this.withTimeout(this.http.post(`${this.BASE}/medical-records`, data));
  }
  getMedicalRecord(id: number): Observable<any> {
    return this.withTimeout(this.http.get(`${this.BASE}/medical-records/${id}`));
  }
  updateMedicalRecord(id: number, data: any): Observable<any> {
    return this.withTimeout(this.http.patch(`${this.BASE}/medical-records/${id}`, data));
  }
  deleteMedicalRecord(id: number): Observable<any> {
    return this.withTimeout(this.http.delete(`${this.BASE}/medical-records/${id}`));
  }

  // Tokens
  generateToken(data: any): Observable<any> {
    return this.withTimeout(this.http.post(`${this.BASE}/tokens/generate`, data));
  }
  getMyTokens(): Observable<any[]> {
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/tokens/my-tokens`));
  }
  validateToken(token: string): Observable<any> {
    return this.withTimeout(this.http.post(`${this.BASE}/tokens/validate`, { token }));
  }
  revokeToken(id: number): Observable<any> {
    return this.withTimeout(this.http.delete(`${this.BASE}/tokens/${id}`));
  }

  // Audit
  getMyAuditLogs(): Observable<any[]> {
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/audit/me`));
  }
  getAllAuditLogs(): Observable<any[]> {
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/audit`));
  }

  // Users (Admin)
  getAllUsers(role?: string): Observable<any[]> {
    const params = role ? `?role=${role}` : '';
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/users${params}`));
  }
  toggleUserStatus(id: string): Observable<any> {
    return this.withTimeout(this.http.patch(`${this.BASE}/users/${id}/toggle-status`, {}));
  }
  approveDoctor(id: string, notasValidacion?: string): Observable<any> {
    return this.withTimeout(this.http.patch(`${this.BASE}/users/${id}/approve`, { notasValidacion }));
  }
  rejectDoctor(id: string, motivoRechazo?: string): Observable<any> {
    return this.withTimeout(this.http.patch(`${this.BASE}/users/${id}/reject`, { motivoRechazo }));
  }
  getDoctorDocument(id: string): Observable<Blob> {
    return this.withTimeout(this.http.get(`${this.BASE}/users/${id}/doctor-document`, { responseType: 'blob' }));
  }

  // Appointments
  getMyAppointments(): Observable<any[]> {
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/appointments/my`));
  }
  createAppointment(data: any): Observable<any> {
    return this.withTimeout(this.http.post(`${this.BASE}/appointments`, data));
  }
  cancelAppointment(id: number, cancelReason?: string): Observable<any> {
    return this.withTimeout(this.http.patch(`${this.BASE}/appointments/${id}/cancel`, { cancelReason }));
  }
  getDoctorSchedule(date?: string): Observable<any[]> {
    const params = date ? `?date=${date}` : '';
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/appointments/doctor/schedule${params}`));
  }
  confirmAppointment(id: number): Observable<any> {
    return this.withTimeout(this.http.patch(`${this.BASE}/appointments/${id}/confirm`, {}));
  }
  rescheduleAppointment(id: number, fechaHoraInicio: string): Observable<any> {
    return this.withTimeout(this.http.patch(`${this.BASE}/appointments/${id}/reschedule`, { fechaHoraInicio }));
  }
  completeAppointment(id: number): Observable<any> {
    return this.withTimeout(this.http.patch(`${this.BASE}/appointments/${id}/complete`, {}));
  }
  getAdminAppointments(estado?: string): Observable<any[]> {
    const params = estado ? `?estado=${estado}` : '';
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/appointments/admin${params}`));
  }

  // Availability
  getAvailableDoctors(): Observable<any[]> {
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/availability/doctors`));
  }
  getDoctorSlots(doctorId: number, date: string): Observable<any[]> {
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/availability/doctor/${doctorId}/slots?date=${date}`));
  }
  getMyAvailability(): Observable<any[]> {
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/availability/me`));
  }
  updateMyAvailability(items: any[]): Observable<any[]> {
    return this.withTimeout(this.http.put<any[]>(`${this.BASE}/availability/me`, { items }));
  }

  getHistorialPaciente(patientId: number) {
    return this.withTimeout(this.http.get<any[]>(`${this.BASE}/medical-records/patient/${patientId}`));
  }

}

