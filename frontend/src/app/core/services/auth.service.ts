import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  role: 'paciente' | 'medico' | 'admin';
  status: string;
}

interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:3000/api';
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const saved = localStorage.getItem('medrecord_user');
    if (saved) {
      try { this.currentUserSubject.next(JSON.parse(saved)); } catch { }
    }
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('medrecord_token');
  }

  get isLoggedIn(): boolean {
    return !!this.token && !!this.currentUser;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('medrecord_token', res.access_token);
        localStorage.setItem('medrecord_user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  register(data: { nombre: string; email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.API}/auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem('medrecord_token');
    localStorage.removeItem('medrecord_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  redirectByRole(): void {
    const role = this.currentUser?.role;
    if (role === 'paciente') this.router.navigate(['/paciente/dashboard']);
    else if (role === 'medico') this.router.navigate(['/medico/dashboard']);
    else if (role === 'admin') this.router.navigate(['/admin/dashboard']);
    else this.router.navigate(['/auth/login']);
  }
}
