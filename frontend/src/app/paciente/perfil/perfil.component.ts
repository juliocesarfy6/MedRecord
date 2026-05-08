import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1>Mi Perfil Médico Base</h1>
      <p>Actualiza tus datos personales y clínicos.</p>
    </div>

    <div class="card" style="max-width: 800px;">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        
        <div class="alert alert-success" *ngIf="success">{{ success }}</div>
        <div class="alert alert-error" *ngIf="error">{{ error }}</div>

        <div class="profile-grid">
          <div class="form-group">
            <label class="form-label">Nombre Completo</label>
            <input formControlName="nombre" type="text" class="form-control" readonly style="background: var(--gray-50); cursor: not-allowed;">
            <p class="form-error" style="color: var(--gray-500);">* Modificable solo en clínicas.</p>
          </div>

          <div class="form-group">
            <label class="form-label">CURP / Identidad</label>
            <input formControlName="curp" type="text" class="form-control" maxlength="18" placeholder="Clave única de registro" [class.error]="form.get('curp')?.invalid && form.get('curp')?.touched">
            <span class="form-error" *ngIf="form.get('curp')?.invalid && form.get('curp')?.touched">CURP inválida.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Fecha de Nacimiento</label>
            <input formControlName="fechaNacimiento" type="date" class="form-control" [attr.max]="today">
          </div>

          <div class="form-group">
            <label class="form-label">Teléfono de Contacto</label>
            <input formControlName="telefono" type="text" class="form-control" maxlength="20" placeholder="555-123-4567" [class.error]="form.get('telefono')?.invalid && form.get('telefono')?.touched">
            <span class="form-error" *ngIf="form.get('telefono')?.invalid && form.get('telefono')?.touched">Teléfono inválido.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Grupo Sanguíneo</label>
            <select formControlName="grupoSanguineo" class="form-control">
              <option value="">No especificado</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Sexo</label>
            <select formControlName="sexo" class="form-control">
              <option value="">No especificado</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-top: 20px;">
          <label class="form-label">Alergias Conocidas</label>
          <textarea formControlName="alergias" class="form-control" rows="3" maxlength="1000" placeholder="Ej: Penicilina, polen..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Dirección Completa</label>
          <input formControlName="direccion" type="text" class="form-control" maxlength="255" placeholder="Calle, Número, Colonia, Ciudad...">
        </div>

        <div style="margin-top: 24px; text-align: right;">
          <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading || form.invalid">
            {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }
  `]
})
export class PerfilComponent implements OnInit {
  form: FormGroup;
  loading = false;
  success = '';
  error = '';
  patientId = '';
  today = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder, private api: ApiService, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      nombre: [''],
      curp: ['', Validators.pattern(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/i)],
      fechaNacimiento: [''],
      telefono: ['', Validators.pattern(/^[0-9+\-\s()]{7,20}$/)],
      grupoSanguineo: [''],
      sexo: [''],
      alergias: ['', Validators.maxLength(1000)],
      direccion: ['', Validators.maxLength(255)]
    });
  }

  ngOnInit() {
    this.api.getMyPatientProfile().subscribe({
      next: (res) => {
        this.patientId = res.id;
        this.form.patchValue({
          nombre: res.user?.nombre,
          curp: res.curp,
          fechaNacimiento: res.fechaNacimiento ? new Date(res.fechaNacimiento).toISOString().split('T')[0] : '',
          telefono: res.telefono,
          grupoSanguineo: res.grupoSanguineo,
          sexo: res.sexo,
          alergias: res.alergias,
          direccion: res.direccion
        });
      },
      error: () => {
        this.error = 'No se pudo cargar tu perfil. Revisa que el backend esté activo.';
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.success = '';
    this.error = '';

    const data = { ...this.form.value };
    if (data.curp) data.curp = data.curp.toUpperCase();
    delete data.nombre; // Don't send user name to patient profile update

    const loadingGuard = window.setTimeout(() => {
      if (!this.loading) return;
      this.error = 'El guardado está tardando demasiado. Intenta de nuevo.';
      this.loading = false;
      this.cdr.detectChanges();
    }, 7000);

    this.api.updateMyPatientProfile(data).pipe(
      finalize(() => {
        window.clearTimeout(loadingGuard);
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.success = 'Perfil de paciente actualizado correctamente.';
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Ocurrió un error al actualizar el perfil.';
      }
    });
  }
}
