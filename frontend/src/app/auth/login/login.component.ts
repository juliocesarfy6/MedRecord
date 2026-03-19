import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg"></div>
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-logo">
            <div class="logo-icon">🏥</div>
            <h1>MedRecord</h1>
            <p>Sistema de Gestión de Historial Médico</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <h2>Iniciar Sesión</h2>
            <p class="auth-subtitle">Ingresa tus credenciales para continuar</p>

            <div *ngIf="error" class="alert alert-error">{{ error }}</div>

            <div class="form-group">
              <label class="form-label">Correo electrónico</label>
              <input formControlName="email" type="email" class="form-control"
                     [class.error]="form.get('email')?.invalid && form.get('email')?.touched"
                     placeholder="correo@ejemplo.com">
              <span class="form-error" *ngIf="form.get('email')?.errors?.['required'] && form.get('email')?.touched">
                El email es requerido
              </span>
            </div>

            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <div class="input-password">
                <input formControlName="password" [type]="showPass ? 'text' : 'password'"
                       class="form-control"
                       [class.error]="form.get('password')?.invalid && form.get('password')?.touched"
                       placeholder="Tu contraseña">
                <button type="button" class="pass-toggle" (click)="showPass = !showPass">
                  {{ showPass ? '🙈' : '👁️' }}
                </button>
              </div>
              <span class="form-error" *ngIf="form.get('password')?.errors?.['required'] && form.get('password')?.touched">
                La contraseña es requerida
              </span>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="loading">
              <span *ngIf="loading" class="spinner-sm"></span>
              {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
            </button>

            <div class="auth-divider">
              <span>¿No tienes cuenta?</span>
              <a routerLink="/auth/register">Regístrate aquí</a>
            </div>

            <div class="test-accounts">
              <p>Cuentas de prueba:</p>
              <button type="button" (click)="fillCredentials('paciente@test.com','Paciente123*')">👤 Paciente</button>
              <button type="button" (click)="fillCredentials('medico@test.com','Medico123*')">👨‍⚕️ Médico</button>
              <button type="button" (click)="fillCredentials('admin@test.com','Admin123*')">⚙️ Admin</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #06B6D4 100%);
    }
    .auth-bg {
      position: absolute; inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .auth-container { position: relative; z-index: 1; width: 100%; max-width: 440px; padding: 20px; }
    .auth-card {
      background: rgba(255,255,255,0.97);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .auth-logo { text-align: center; margin-bottom: 32px; }
    .logo-icon { font-size: 48px; margin-bottom: 8px; }
    .auth-logo h1 { font-size: 28px; font-weight: 800; color: #1E3A8A; }
    .auth-logo p { font-size: 13px; color: #64748B; margin-top: 4px; }
    .auth-form h2 { font-size: 20px; font-weight: 700; color: #0F172A; }
    .auth-subtitle { font-size: 13px; color: #64748B; margin-bottom: 24px; margin-top: 4px; }
    .w-full { width: 100%; justify-content: center; margin-top: 8px; }
    .input-password { position: relative; }
    .input-password .form-control { padding-right: 44px; }
    .pass-toggle {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 16px; padding: 0;
    }
    .auth-divider { display: flex; align-items: center; gap: 8px; margin-top: 20px; font-size: 13px; color: #64748B; }
    .auth-divider a { color: #2563EB; font-weight: 600; text-decoration: none; }
    .auth-divider a:hover { text-decoration: underline; }
    .spinner-sm {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .test-accounts {
      margin-top: 24px;
      padding: 16px;
      background: #F8FAFC;
      border-radius: 10px;
      text-align: center;
    }
    .test-accounts p { font-size: 12px; color: #64748B; margin-bottom: 10px; font-weight: 600; }
    .test-accounts button {
      margin: 0 4px;
      padding: 6px 12px;
      border: 1.5px solid #E2E8F0;
      background: white;
      border-radius: 8px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      font-weight: 500;
    }
    .test-accounts button:hover { background: #2563EB; color: white; border-color: #2563EB; }
    button:disabled { opacity: 0.7; cursor: not-allowed; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  showPass = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    if (auth.isLoggedIn) auth.redirectByRole();
  }

  fillCredentials(email: string, password: string) {
    this.form.patchValue({ email, password });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => { this.auth.redirectByRole(); },
      error: (err) => {
        this.error = err?.error?.message || 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }
}
