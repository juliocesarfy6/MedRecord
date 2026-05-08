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
        <strong>Nota:</strong> Solo aparecen pacientes que te autorizaron mediante un token validado y vigente.
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
          <textarea formControlName="diagnostico" class="form-control" rows="3" placeholder="Descripción detallada del diagnóstico..." [class.error]="form.get('diagnostico')?.invalid && form.get('diagnostico')?.touched"></textarea>
          <span class="form-error" *ngIf="form.get('diagnostico')?.invalid && form.get('diagnostico')?.touched">Requerido</span>
        </div>

        <div class="form-group">
          <label class="form-label">Tratamiento e Indicaciones</label>
          <textarea formControlName="tratamiento" class="form-control" rows="3" placeholder="Medidas y pasos de tratamiento..." [class.error]="form.get('tratamiento')?.invalid && form.get('tratamiento')?.touched"></textarea>
          <span class="form-error" *ngIf="form.get('tratamiento')?.invalid && form.get('tratamiento')?.touched">Requerido</span>
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
  patients: any[] = [];

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router) {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      fecha: [today, Validators.required],
      motivo: ['', [Validators.required, Validators.minLength(3)]],
      diagnostico: ['', Validators.required],
      tratamiento: ['', Validators.required],
      medicamentos: [''],
      observaciones: ['']
    });
  }

  ngOnInit() {
    this.api.getAuthorizedPatients().subscribe({
      next: (res) => this.patients = res,
      error: () => this.error = 'Error cargando pacientes autorizados. Valida primero un token vigente del paciente.'
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

    // --- TRADUCCIÓN DE DATOS PARA EL BACKEND ---
    const dataParaBackend = {
      ...this.form.value,
      // 1. Forzamos que el ID sea número (el <select> lo manda como string)
      patientId: Number(this.form.value.patientId),

      // 2. Renombramos 'motivo' a 'motivoConsulta' (lo que pide NestJS)
      motivoConsulta: this.form.value.motivo,

      // 3. Opcional: Si el backend no tiene el campo 'medicamentos', 
      // puedes concatenarlo al tratamiento o dejarlo si el DTO lo ignora.
      tratamiento: `${this.form.value.tratamiento}\n\nMedicamentos: ${this.form.value.medicamentos}`
    };

    // Eliminamos el campo 'motivo' original para que no ensucie la petición
    delete dataParaBackend.motivo;
    delete dataParaBackend.medicamentos;
    // -------------------------------------------

    this.api.createMedicalRecord(dataParaBackend).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Consulta registrada correctamente en el expediente magnético del paciente.';
        this.form.reset({
          fecha: new Date().toISOString().split('T')[0],
          patientId: '' // Limpiamos también el select
        });
        setTimeout(() => this.success = '', 4000);
      },
      error: (err) => {
        this.loading = false;
        // Esto te mostrará el mensaje exacto si algo más falla
        this.error = err?.error?.message || 'Ocurrió un error al registrar la consulta.';
      }
    });
  }
}
