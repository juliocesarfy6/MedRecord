import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generar-token',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="width: 100%; max-width: 800px; margin: 0 auto; padding: 0;">
      <div class="page-header">
        <h1>Generar Token de Acceso</h1>
        <p>Otorga acceso temporal a tu historial médico a un profesional de la salud.</p>
      </div>

      <div class="card">
        <div *ngIf="generatedToken" class="token-result">
          <div class="success-icon">✅</div>
          <h3>Token Generado Exitosamente</h3>
          <p>Comparte este código con tu médico. Solo podrá usarlo una vez validado.</p>
          
          <div class="token-box">
            {{ generatedToken }}
          </div>

          <div class="token-actions">
            <button class="btn btn-outline" (click)="copyToken()">Copiar Token</button>
            <button class="btn btn-primary" (click)="goToTokens()">Ver mis tokens</button>
          </div>
        </div>

        <form *ngIf="!generatedToken" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="alert alert-error" *ngIf="error">{{ error }}</div>

          <div class="form-group">
            <label class="form-label">Nivel de Acceso</label>
            <select formControlName="nivelAcceso" class="form-control">
              <option value="lectura">Solo Lectura (Recomendado)</option>
              <option value="edicion">Acceso Completo</option>
            </select>
            <span class="form-error" *ngIf="form.get('nivelAcceso')?.touched && form.get('nivelAcceso')?.invalid">Requerido</span>
          </div>

          <div class="form-group">
            <label class="form-label">Tiempo de Validez (Horas)</label>
            <select formControlName="horasExpiracion" class="form-control" [class.error]="form.get('horasExpiracion')?.invalid && form.get('horasExpiracion')?.touched">
              <option value="1">1 Hora (Consulta Rápida)</option>
              <option value="8">8 Horas (Consulta Normal)</option>
              <option value="24">24 Horas (Tratamiento Diario)</option>
              <option value="72">72 Horas (Seguimiento Corto)</option>
              <option value="168">1 Semana (Tratamiento Extendido)</option>
            </select>
            <span class="form-error" *ngIf="form.get('horasExpiracion')?.invalid && form.get('horasExpiracion')?.touched">Debe estar entre 1 y 168 horas</span>
          </div>

          <div class="form-group">
            <label class="form-label">Descripción o Motivo (Opcional)</label>
            <input formControlName="descripcion" type="text" class="form-control" maxlength="255" placeholder="Ej: Consulta con Cardiólogo Dr. Pérez">
          </div>

          <div style="margin-top: 24px;">
            <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="loading || form.invalid">
              <span *ngIf="loading" class="spinner-sm"></span>
              {{ loading ? 'Generando...' : 'Generar Token Seguro' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .w-full { width: 100%; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 24px; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
    .page-header p { font-size: 14px; color: #64748B; }
    .card { background: #FFFFFF; border-radius: 12px; padding: 24px; border: 1px solid #F1F5F9; box-shadow: 0 4px 16px rgba(0,0,0,0.08); max-width: 600px; margin: 0 auto; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-label { font-size: 13px; font-weight: 600; color: #334155; }
    .form-control { padding: 11px 14px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 14px; color: #1E293B; background: #FFFFFF; outline: none; width: 100%; font-family: inherit; transition: all 0.2s ease; }
    .form-control:focus { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12); }
    .form-error { font-size: 12px; color: #EF4444; }
    .alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
    .alert-error { background: rgba(239, 68, 68, 0.1); color: #DC2626; border: 1px solid rgba(239, 68, 68, 0.3); }
    .btn { padding: 10px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
    .btn-primary { background: #2563EB; color: white; }
    .btn-primary:hover { background: #1E40AF; transform: translateY(-1px); }
    .btn-primary:disabled { background: #CBD5E1; cursor: not-allowed; }
    .btn-outline { background: transparent; color: #2563EB; border: 1.5px solid #2563EB; }
    .btn-outline:hover { background: #F0F4FF; }
    .btn-lg { padding: 14px 28px; font-size: 16px; }
    .token-result { text-align: center; padding: 20px 0; }
    .success-icon { font-size: 48px; margin-bottom: 16px; }
    .token-result h3 { font-size: 20px; color: #0F172A; margin-bottom: 8px; }
    .token-result p { color: #64748B; margin-bottom: 24px; }
    .token-box { font-family: 'Courier New', monospace; font-size: 28px; font-weight: 800; letter-spacing: 0.05em; color: #1E3A8A; background: #F8FAFC; border: 2px dashed #2563EB; padding: 24px; border-radius: 12px; margin: 24px 0; word-break: break-all; user-select: all; }
    .token-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .spinner-sm { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.4); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class GenerarTokenComponent {
  form: FormGroup;
  loading = false;
  error = '';
  generatedToken = '';

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      nivelAcceso: ['lectura', Validators.required],
      horasExpiracion: [24, [Validators.required, Validators.min(1), Validators.max(168)]],
      descripcion: ['', Validators.maxLength(255)]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';

    // Convert hours to number explicitly
    const data = { ...this.form.value, horasExpiracion: Number(this.form.value.horasExpiracion) };

    this.api.generateToken(data).subscribe({
      next: (res) => {
        this.generatedToken = res.token;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Ocurrió un error al generar el token.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  async copyToken() {
    if (!this.generatedToken) return;

    try {
      await navigator.clipboard.writeText(this.generatedToken);
      alert('Token copiado al portapapeles');
    } catch {
      this.error = 'No se pudo copiar el token automáticamente.';
      this.cdr.detectChanges();
    }
  }

  goToTokens() {
    this.router.navigate(['/paciente/tokens']);
  }
}
