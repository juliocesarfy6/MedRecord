import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

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
            <input formControlName="curp" type="text" class="form-control" placeholder="Clave única de registro">
          </div>

          <div class="form-group">
            <label class="form-label">Fecha de Nacimiento</label>
            <input formControlName="fechaNacimiento" type="date" class="form-control">
          </div>

          <div class="form-group">
            <label class="form-label">Teléfono de Contacto</label>
            <input formControlName="telefono" type="text" class="form-control" placeholder="555-123-4567">
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
          <textarea formControlName="alergias" class="form-control" rows="3" placeholder="Ej: Penicilina, polen..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Dirección Completa</label>
          <input formControlName="direccion" type="text" class="form-control" placeholder="Calle, Número, Colonia, Ciudad...">
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

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
      nombre: [''],
      curp: [''],
      fechaNacimiento: [''],
      telefono: [''],
      grupoSanguineo: [''],
      sexo: [''],
      alergias: [''],
      direccion: ['']
    });
  }

  ngOnInit() {
    this.api.getMyPatientProfile().subscribe(res => {
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
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.success = '';
    this.error = '';

    const data = { ...this.form.value };
    delete data.nombre; // Don't send user name to patient profile update

    this.api.updateMyPatientProfile(data).subscribe({
      next: () => {
        this.success = 'Perfil de paciente actualizado correctamente.';
        this.loading = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: () => {
        this.error = 'Ocurrió un error al actualizar el perfil.';
        this.loading = false;
      }
    });
  }
}
