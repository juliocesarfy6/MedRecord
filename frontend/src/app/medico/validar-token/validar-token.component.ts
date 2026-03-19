import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-validar-token',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1>Validar Token de Acceso</h1>
      <p>Ingresa el token proporcionado por el paciente para acceder a su expediente clínico.</p>
    </div>

    <div class="card" style="max-width: 500px; margin: 0 auto; margin-top: 40px;">
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" style="text-align: center;">
        <div style="font-size: 64px; margin-bottom: 24px;">🔓</div>
        
        <div class="alert alert-error" *ngIf="error">{{ error }}</div>

        <div class="form-group" style="text-align: left;">
          <label class="form-label" style="text-align: center; display: block; font-size: 16px;">Token del Paciente</label>
          <input formControlName="token" type="text" class="form-control" 
                 style="font-family: monospace; font-size: 24px; text-align: center; letter-spacing: 0.1em; padding: 16px; text-transform: uppercase;" 
                 placeholder="000000000000" maxlength="12">
        </div>

        <button type="submit" class="btn btn-primary btn-lg w-full" style="justify-content: center; margin-top: 24px; width: 100%;" [disabled]="form.invalid || loading">
          <span *ngIf="loading" class="spinner-sm" style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; display: inline-block; animation: spin 0.7s linear infinite;"></span>
          {{ loading ? 'Validando...' : 'Acceder al Expediente' }}
        </button>
      </form>
    </div>
  `
})
export class ValidarTokenComponent {
  form = this.fb.group({ token: ['', [Validators.required, Validators.minLength(8)]] });
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const token = this.form.value.token?.toUpperCase().trim() || '';

    this.api.validateToken(token).subscribe({
      next: (res) => {
        // Save access in memory/session if needed, then route to the patient record
        this.loading = false;
        // The API returns patientId and nivelAcceso
        localStorage.setItem(`token_access_${res.patientId}`, token);
        this.router.navigate(['/medico/expediente', res.patientId]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Token inválido, expirado o revocado por el paciente.';
      }
    });
  }
}
