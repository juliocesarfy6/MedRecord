import { ChangeDetectorRef, Component } from '@angular/core';
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

            <ng-container *ngIf="form.get('role')?.value === 'paciente'">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Fecha de nacimiento</label>
                  <input formControlName="fecha_nacimiento" type="date" class="form-control">
                  <span class="form-error" *ngIf="showError('fecha_nacimiento')">La fecha de nacimiento es requerida</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Sexo</label>
                  <select formControlName="sexo" class="form-control">
                    <option value="">Selecciona</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                  <span class="form-error" *ngIf="showError('sexo')">El sexo es requerido</span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">CURP / Identidad</label>
                <input formControlName="curp" type="text" class="form-control" maxlength="18" placeholder="ABCD000000HSLXXX00">
                <span class="form-error" *ngIf="showError('curp')">Captura una CURP válida de 18 caracteres</span>
              </div>

              <div class="form-group">
                <label class="form-label">Teléfono de contacto</label>
                <input formControlName="telefono" type="tel" class="form-control" placeholder="6681234567">
                <span class="form-error" *ngIf="showError('telefono')">Captura un teléfono válido</span>
              </div>

              <div class="form-group">
                <label class="form-label">Dirección</label>
                <input formControlName="direccion" type="text" class="form-control" placeholder="Ciudad, estado">
              </div>
            </ng-container>

            <ng-container *ngIf="form.get('role')?.value === 'medico'">
              <div class="form-group">
                <label class="form-label">Especialidad médica</label>
                <input formControlName="especialidad" type="text" class="form-control" placeholder="Medicina general">
                <span class="form-error" *ngIf="showError('especialidad')">La especialidad es requerida</span>
              </div>

              <div class="form-group">
                <label class="form-label">Cédula profesional</label>
                <input formControlName="cedulaProfesional" type="text" class="form-control" placeholder="ABC12345">
                <span class="form-error" *ngIf="showError('cedulaProfesional')">Captura una cédula válida</span>
              </div>
            </ng-container>

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
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .w-full { width: 100%; justify-content: center; margin-top: 8px; }
    .auth-divider { display: flex; align-items: center; gap: 8px; margin-top: 20px; font-size: 13px; color: #64748B; }
    .auth-divider a { color: #2563EB; font-weight: 600; text-decoration: none; }
    button:disabled { opacity: 0.7; cursor: not-allowed; }
    @media (max-width: 520px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['paciente', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      curp: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/)]],
      telefono: ['', [Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]],
      direccion: [''],
      especialidad: [''],
      cedulaProfesional: [''],
    });
    this.form.get('role')?.valueChanges.subscribe((role) => this.applyRoleValidators(role));
    this.applyRoleValidators(this.form.get('role')?.value);
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    this.auth.register(this.buildPayload()).subscribe({
      next: () => {
        this.success = 'Cuenta creada exitosamente. Por favor inicia sesión.';
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al registrar';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  showError(controlName: string) {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private applyRoleValidators(role: string) {
    const patientRequired = ['fecha_nacimiento', 'sexo', 'curp'];
    const doctorRequired = ['especialidad', 'cedulaProfesional'];

    for (const controlName of patientRequired) {
      const control = this.form.get(controlName);
      if (!control) continue;
      if (role === 'paciente') {
        const validators = controlName === 'curp'
          ? [Validators.required, Validators.pattern(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/)]
          : [Validators.required];
        control.setValidators(validators);
      } else {
        control.clearValidators();
        control.setValue('');
      }
      control.updateValueAndValidity({ emitEvent: false });
    }

    for (const controlName of doctorRequired) {
      const control = this.form.get(controlName);
      if (!control) continue;
      if (role === 'medico') {
        const validators = controlName === 'cedulaProfesional'
          ? [Validators.required, Validators.pattern(/^[A-Z0-9-]{5,50}$/)]
          : [Validators.required, Validators.maxLength(100)];
        control.setValidators(validators);
      } else {
        control.clearValidators();
        control.setValue('');
      }
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private buildPayload() {
    const raw = this.form.value;
    const base: any = {
      nombre: raw.nombre,
      email: raw.email,
      password: raw.password,
      role: raw.role,
    };

    if (raw.role === 'paciente') {
      return {
        ...base,
        fecha_nacimiento: raw.fecha_nacimiento,
        sexo: raw.sexo,
        curp: String(raw.curp || '').trim().toUpperCase(),
        telefono: raw.telefono,
        direccion: raw.direccion,
      };
    }

    return {
      ...base,
      especialidad: raw.especialidad,
      cedulaProfesional: String(raw.cedulaProfesional || '').trim().toUpperCase(),
    };
  }
}
