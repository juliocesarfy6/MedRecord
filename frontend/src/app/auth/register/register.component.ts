import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-logo">
            <div class="logo-icon">🏥</div>
            <h1>MedRecord</h1>
            <p>Crea tu cuenta</p>
          </div>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <h2>Registro</h2>
            <div *ngIf="error" class="alert alert-error">{{ error }}</div>
            <div *ngIf="success" class="alert alert-success">{{ success }}</div>

            <div class="form-group">
              <label class="form-label">Nombre completo</label>
              <input formControlName="nombre" type="text" class="form-control" placeholder="Juan Pérez">
            </div>
            <div class="form-group">
              <label class="form-label">Correo electrónico</label>
              <input formControlName="email" type="email" class="form-control" placeholder="correo@ejemplo.com">
            </div>
            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <input formControlName="password" type="password" class="form-control" placeholder="Mínimo 8 caracteres">
            </div>
            <div class="form-group">
              <label class="form-label">Rol</label>
              <select formControlName="role" class="form-control">
                <option value="paciente">Paciente</option>
                <option value="medico">Médico (requiere aprobación)</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="loading">
              {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
            </button>
            <div class="auth-divider">
              <span>¿Ya tienes cuenta?</span>
              <a routerLink="/auth/login">Inicia sesión</a>
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
      background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #06B6D4 100%);
    }
    .auth-container { width: 100%; max-width: 440px; padding: 20px; }
    .auth-card {
      background: rgba(255,255,255,0.97);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .auth-logo { text-align: center; margin-bottom: 28px; }
    .logo-icon { font-size: 48px; margin-bottom: 8px; }
    .auth-logo h1 { font-size: 28px; font-weight: 800; color: #1E3A8A; }
    .auth-logo p { font-size: 13px; color: #64748B; margin-top: 4px; }
    .auth-form h2 { font-size: 20px; font-weight: 700; color: #0F172A; margin-bottom: 20px; }
    .w-full { width: 100%; justify-content: center; margin-top: 8px; }
    .auth-divider { display: flex; align-items: center; gap: 8px; margin-top: 20px; font-size: 13px; color: #64748B; }
    .auth-divider a { color: #2563EB; font-weight: 600; text-decoration: none; }
    button:disabled { opacity: 0.7; cursor: not-allowed; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['paciente', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.success = 'Cuenta creada exitosamente. Por favor inicia sesión.';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al registrar';
        this.loading = false;
      }
    });
  }
}
