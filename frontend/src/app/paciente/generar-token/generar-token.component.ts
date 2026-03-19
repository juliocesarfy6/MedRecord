import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generar-token',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1>Generar Token de Acceso</h1>
      <p>Otorga acceso temporal a tu historial médico a un profesional de la salud.</p>
    </div>

    <div class="card" style="max-width: 600px;">
      <div *ngIf="generatedToken" class="token-result">
        <div class="success-icon">✅</div>
        <h3>Token Generado Exitosamente</h3>
        <p>Comparte este código con tu médico. Solo podrá usarlo una vez validado.</p>
        
        <div class="token-box">
          {{ generatedToken }}
        </div>

        <div class="token-actions">
          <button class="btn btn-outline" (click)="copyToken()">Copiar Token</button>
          <button class="btn btn-primary" (click)="router.navigate(['/paciente/tokens'])">Ver mis tokens</button>
        </div>
      </div>

      <form *ngIf="!generatedToken" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="alert alert-error" *ngIf="error">{{ error }}</div>

        <div class="form-group">
          <label class="form-label">Nivel de Acceso</label>
          <select formControlName="nivelAcceso" class="form-control">
            <option value="lectura">Solo Lectura (Recomendado)</option>
            <option value="completo">Acceso Completo</option>
          </select>
          <span class="form-error" *ngIf="form.get('nivelAcceso')?.touched && form.get('nivelAcceso')?.invalid">Requerido</span>
        </div>

        <div class="form-group">
          <label class="form-label">Tiempo de Validez (Horas)</label>
          <select formControlName="horasExpiracion" class="form-control">
            <option [value]="1">1 Hora (Consulta Rápida)</option>
            <option [value]="8">8 Horas (Consulta Normal)</option>
            <option [value]="24">24 Horas (Tratamiento Diario)</option>
            <option [value]="72">72 Horas (Seguimiento Corto)</option>
            <option [value]="168">1 Semana (Tratamiento Extendido)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Descripción o Motivo (Opcional)</label>
          <input formControlName="descripcion" type="text" class="form-control" placeholder="Ej: Consulta con Cardiólogo Dr. Pérez">
        </div>

        <div style="margin-top: 24px;">
          <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="loading || form.invalid">
            <span *ngIf="loading" class="spinner-sm"></span>
            {{ loading ? 'Generando...' : 'Generar Token Seguro' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .w-full { width: 100%; justify-content: center; }
    .token-result { text-align: center; padding: 20px 0; }
    .success-icon { font-size: 48px; margin-bottom: 16px; }
    .token-result h3 { font-size: 20px; color: var(--gray-900); }
    .token-result p { color: var(--gray-500); margin-top: 8px; margin-bottom: 24px; }
    .token-box {
      font-family: monospace;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: var(--primary-dark);
      background: var(--gray-50);
      border: 2px dashed var(--primary);
      padding: 24px;
      border-radius: var(--radius);
      margin-bottom: 24px;
      user-select: all;
    }
    .token-actions { display: flex; gap: 12px; justify-content: center; }
    .spinner-sm {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white; border-radius: 50%; display: inline-block;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class GenerarTokenComponent {
  form: FormGroup;
  loading = false;
  error = '';
  generatedToken = '';

  constructor(private fb: FormBuilder, private api: ApiService, public router: Router) {
    this.form = this.fb.group({
      nivelAcceso: ['lectura', Validators.required],
      horasExpiracion: [24, Validators.required],
      descripcion: ['']
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    
    // Convert hours to number explicitly
    const data = { ...this.form.value, horasExpiracion: Number(this.form.value.horasExpiracion) };

    this.api.generateToken(data).subscribe({
      next: (res) => {
        this.generatedToken = res.token;
        this.loading = false;
      },
      error: () => {
        this.error = 'Ocurrió un error al generar el token.';
        this.loading = false;
      }
    });
  }

  copyToken() {
    navigator.clipboard.writeText(this.generatedToken);
    alert('Token copiado al portapapeles');
  }
}
