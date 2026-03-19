import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrar-consulta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1>Registrar Nueva Consulta</h1>
      <p>Añade una nueva entrada clínica al expediente del paciente.</p>
    </div>

    <div class="card" style="max-width: 800px;">
      
      <div class="alert alert-warning" style="margin-bottom: 24px;">
        <strong>Nota:</strong> Para registrar una consulta, necesitas asegurar tener el ID del paciente disponible, o que tengas acceso mediante token previamente validado. 
        En una clínica real, el sistema selecciona al paciente automáticamente al escanear/validar token.
      </div>

      <div *ngIf="success" class="alert alert-success">{{ success }}</div>
      <div *ngIf="error" class="alert alert-error">{{ error }}</div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="form-label">Paciente</label>
          <select formControlName="patientId" class="form-control" [class.error]="form.get('patientId')?.invalid && form.get('patientId')?.touched">
            <option value="">Selecciona un paciente validado</option>
            <option *ngFor="let p of patients" [value]="p.id">{{ p.user?.nombre }} ({{ p.curp || 'Sin CURP' }})</option>
          </select>
          <span class="form-error" *ngIf="form.get('patientId')?.invalid && form.get('patientId')?.touched">Requerido</span>
        </div>

        <div class="form-group">
          <label class="form-label">Fecha de la Consulta</label>
          <input formControlName="fecha" type="date" class="form-control" [class.error]="form.get('fecha')?.invalid && form.get('fecha')?.touched">
          <span class="form-error" *ngIf="form.get('fecha')?.invalid && form.get('fecha')?.touched">Requerido</span>
        </div>

        <div class="form-group">
          <label class="form-label">Motivo Principal</label>
          <input formControlName="motivo" type="text" class="form-control" placeholder="Ej: Dolor abdominal recurrente" [class.error]="form.get('motivo')?.invalid && form.get('motivo')?.touched">
          <span class="form-error" *ngIf="form.get('motivo')?.invalid && form.get('motivo')?.touched">Requerido</span>
        </div>

        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label">Diagnóstico Clínico</label>
          <textarea formControlName="diagnostico" class="form-control" rows="3" placeholder="Descripción detallada del diagnóstico..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Tratamiento e Indicaciones</label>
          <textarea formControlName="tratamiento" class="form-control" rows="3" placeholder="Medidas y pasos de tratamiento..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Medicamentos (Receta)</label>
          <textarea formControlName="medicamentos" class="form-control" rows="2" placeholder="Listado de medicamentos y dosis..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Observaciones Privadas / Notas</label>
          <textarea formControlName="observaciones" class="form-control" rows="2" placeholder="Cualquier otra observación médica general..."></textarea>
        </div>

        <div style="margin-top: 24px; text-align: right;">
          <button type="submit" class="btn btn-primary btn-lg" [disabled]="form.invalid || loading">
            <span *ngIf="loading" class="spinner-sm"></span>
            {{ loading ? 'Guardando Registro...' : 'Guardar Consulta en Expediente' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class RegistrarConsultaComponent implements OnInit {
  form: FormGroup;
  loading = false;
  success = '';
  error = '';
  patients: any[] = []; // In a real system, you'd only see patients that authorized you.

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router) {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      fecha: [today, Validators.required],
      motivo: ['', [Validators.required, Validators.minLength(3)]],
      diagnostico: [''],
      tratamiento: [''],
      medicamentos: [''],
      observaciones: ['']
    });
  }

  ngOnInit() {
    this.api.getAllPatients().subscribe({
      next: (res) => this.patients = res,
      error: () => this.error = 'Error cargando lista de pacientes (asegúrate de ser médico o admin).'
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    
    this.loading = true;
    this.success = '';
    this.error = '';

    this.api.createMedicalRecord(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Consulta registrada correctamente en el expediente magnético del paciente.';
        this.form.reset({
          fecha: new Date().toISOString().split('T')[0]
        });
        setTimeout(() => this.success = '', 4000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Ocurrió un error al registrar la consulta.';
      }
    });
  }
}
