import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1>Mi Perfil Médico</h1>
      <p>Actualiza tus datos profesionales y revisa el estado de tu validación.</p>
    </div>

    <div class="profile-layout">
      <div class="card profile-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="card-header profile-header">
            <div>
              <h2 class="card-title">Datos profesionales</h2>
              <p class="muted">Estos datos ayudan a pacientes y administradores a identificar tu perfil.</p>
            </div>
            <span class="badge" [ngClass]="profile?.validadoPorAdmin ? 'badge-success' : 'badge-warning'">
              {{ profile?.validadoPorAdmin ? 'Validado' : 'Pendiente' }}
            </span>
          </div>

          <div class="alert alert-success" *ngIf="success">{{ success }}</div>
          <div class="alert alert-error" *ngIf="error">{{ error }}</div>
          <div class="alert alert-info" *ngIf="loading">Cargando perfil...</div>

          <div class="profile-grid">
            <div class="form-group">
              <label class="form-label">Nombre completo</label>
              <input formControlName="nombre" type="text" class="form-control" maxlength="100">
              <span class="form-error" *ngIf="form.get('nombre')?.invalid && form.get('nombre')?.touched">Nombre requerido.</span>
            </div>

            <div class="form-group">
              <label class="form-label">Correo electrónico</label>
              <input formControlName="email" type="email" class="form-control" readonly>
              <p class="form-hint">El correo se mantiene fijo para el acceso de cuenta.</p>
            </div>

            <div class="form-group">
              <label class="form-label">Especialidad</label>
              <input formControlName="especialidad" type="text" class="form-control" maxlength="100" placeholder="Ej. Medicina general">
            </div>

            <div class="form-group">
              <label class="form-label">Cédula profesional</label>
              <input formControlName="cedulaProfesional" type="text" class="form-control" maxlength="50" [class.error]="form.get('cedulaProfesional')?.invalid && form.get('cedulaProfesional')?.touched">
              <span class="form-error" *ngIf="form.get('cedulaProfesional')?.invalid && form.get('cedulaProfesional')?.touched">Cédula inválida.</span>
            </div>

            <div class="form-group">
              <label class="form-label">CURP</label>
              <input formControlName="curp" type="text" class="form-control" maxlength="18" [class.error]="form.get('curp')?.invalid && form.get('curp')?.touched">
              <span class="form-error" *ngIf="form.get('curp')?.invalid && form.get('curp')?.touched">CURP inválida.</span>
            </div>

            <div class="form-group">
              <label class="form-label">Documento de cédula</label>
              <input class="form-control" [value]="profile?.documentoCedulaNombre || 'Sin archivo registrado'" readonly>
              <p class="form-hint">Para cambiar el archivo de validación, solicita revisión administrativa.</p>
            </div>
          </div>

          <div class="validation-note" *ngIf="profile?.notasValidacion || profile?.motivoRechazo">
            <strong>Revisión administrativa</strong>
            <p *ngIf="profile?.notasValidacion">{{ profile.notasValidacion }}</p>
            <p *ngIf="profile?.motivoRechazo">{{ profile.motivoRechazo }}</p>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="saving || form.invalid">
              {{ saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>

      <div class="card activity-card">
        <div class="card-header">
          <h2 class="card-title">Actividad reciente</h2>
        </div>

        <div class="table-container" *ngIf="logs.length > 0; else noLogs">
          <table class="activity-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Acción</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of logs">
                <td>{{ (log.fechaHora || log.fecha) | date:'dd/MM/yyyy HH:mm' }}</td>
                <td><span class="badge badge-info">{{ log.accion }}</span></td>
                <td>{{ log.detalles || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noLogs>
          <div class="empty-state">
            <div class="icon">i</div>
            <h3>Sin actividad reciente</h3>
            <p>Aún no hay registros vinculados a tu cuenta.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
      gap: 20px;
      align-items: start;
    }
    .profile-header {
      align-items: flex-start;
      gap: 12px;
    }
    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .muted,
    .form-hint {
      color: #64748B;
      font-size: 13px;
      margin-top: 4px;
    }
    .validation-note {
      margin-top: 18px;
      padding: 14px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      background: #F8FAFC;
      color: #334155;
    }
    .validation-note p {
      margin-top: 6px;
      color: #64748B;
    }
    .form-actions {
      margin-top: 24px;
      text-align: right;
    }
    .activity-card {
      overflow: hidden;
    }
    .activity-table {
      min-width: 520px;
    }
    @media (max-width: 900px) {
      .profile-layout,
      .profile-grid {
        grid-template-columns: 1fr;
      }
      .form-actions {
        text-align: stretch;
      }
      .form-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class PerfilComponent implements OnInit {
  form: FormGroup;
  profile: any = null;
  logs: any[] = [];
  loading = true;
  saving = false;
  success = '';
  error = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      email: [{ value: '', disabled: true }],
      especialidad: ['', Validators.maxLength(100)],
      cedulaProfesional: ['', Validators.pattern(/^[A-Z0-9-]{5,50}$/i)],
      curp: ['', Validators.pattern(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/i)],
    });
  }

  ngOnInit() {
    this.loading = true;
    this.error = '';

    forkJoin({
      profile: this.api.getMyDoctorProfile(),
      logs: this.api.getMyAuditLogs().pipe(catchError(() => of([]))),
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: ({ profile, logs }) => {
        this.profile = profile;
        this.logs = logs.slice(0, 8);
        this.form.patchValue({
          nombre: profile.nombre,
          email: profile.email,
          especialidad: profile.especialidad,
          cedulaProfesional: profile.cedulaProfesional,
          curp: profile.curp,
        });
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo cargar tu perfil médico.';
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.success = '';
    this.error = '';

    const data = {
      ...this.form.getRawValue(),
      cedulaProfesional: this.form.value.cedulaProfesional?.toUpperCase(),
      curp: this.form.value.curp?.toUpperCase(),
    };
    delete data.email;

    this.api.updateMyDoctorProfile(data).pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.form.patchValue({
          nombre: profile.nombre,
          email: profile.email,
          especialidad: profile.especialidad,
          cedulaProfesional: profile.cedulaProfesional,
          curp: profile.curp,
        });
        this.auth.updateCurrentUserName(profile.nombre);
        this.success = 'Perfil médico actualizado correctamente.';
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo actualizar el perfil médico.';
      },
    });
  }
}
