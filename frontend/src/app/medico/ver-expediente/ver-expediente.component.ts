import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-ver-expediente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1>Expediente Clínico</h1>
          <p>Vista médica autorizada por token del paciente.</p>
        </div>
        <span class="badge badge-success" style="font-size: 14px; padding: 8px 16px;">✓ Acceso Validado</span>
      </div>
    </div>

    <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>
    <div class="alert alert-error" *ngIf="error">{{ error }}</div>
    <div class="alert alert-success" *ngIf="success">{{ success }}</div>

    <div *ngIf="!loading && !error && patient" class="dashboard-grid">
      
      <div class="card" style="align-self: start;">
        <div class="card-header">
          <h2 class="card-title">Datos del Paciente</h2>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <p style="font-size: 11px; font-weight: 700; color: var(--gray-400); text-transform: uppercase;">Nombre Completo</p>
            <p style="font-size: 16px; font-weight: 600; color: var(--gray-900);">{{ patient.user?.nombre }}</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <p style="font-size: 11px; font-weight: 700; color: var(--gray-400); text-transform: uppercase;">Sexo</p>
              <p style="font-size: 14px; font-weight: 500; text-transform: capitalize;">{{ patient.sexo || 'No disp.' }}</p>
            </div>
            <div>
              <p style="font-size: 11px; font-weight: 700; color: var(--gray-400); text-transform: uppercase;">Sangre</p>
              <p style="font-size: 14px; font-weight: 500;">
                <span class="badge badge-info">{{ patient.grupoSanguineo || 'N/D' }}</span>
              </p>
            </div>
          </div>

          <div>
            <p style="font-size: 11px; font-weight: 700; color: var(--gray-400); text-transform: uppercase;">Nacimiento</p>
            <p style="font-size: 14px; font-weight: 500;">{{ patient.fechaNacimiento ? (patient.fechaNacimiento | date:'dd/MM/yyyy') : 'No registrado' }}</p>
          </div>
          
          <div style="padding-top: 16px; border-top: 1px dashed var(--gray-200);">
            <p style="font-size: 11px; font-weight: 700; color: var(--danger); text-transform: uppercase; margin-bottom: 4px;">Alergias</p>
            <p style="font-size: 14px; font-weight: 500; color: var(--danger);">{{ patient.alergias || 'Ninguna conocida' }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Historial de Consultas</h2>
        </div>

        <div class="table-container" *ngIf="records.length > 0; else noRecords">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Médico</th>
                <th>Motivo</th>
                <th>Diagnóstico</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rec of records">
                <td>{{ rec.fecha | date:'dd/MM/yyyy' }}</td>
                <td>Dr. {{ rec.doctor?.user?.nombre || 'No especificado' }}</td>
                <td>{{ rec.motivo }}</td>
                <td>{{ rec.diagnostico || '—' }}</td>
                <td>
                  <div class="record-actions">
                    <button class="btn btn-outline btn-sm" (click)="startEdit(rec)">Editar</button>
                    <button class="btn btn-danger btn-sm" (click)="deleteRecord(rec.id)" [disabled]="deletingId === rec.id">
                      {{ deletingId === rec.id ? 'Eliminando...' : 'Eliminar' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <form class="edit-panel" *ngIf="editingRecord" [formGroup]="editForm" (ngSubmit)="saveEdit()">
          <div class="card-header">
            <h3 class="card-title">Editar Consulta</h3>
            <button type="button" class="btn btn-outline btn-sm" (click)="cancelEdit()">Cancelar</button>
          </div>

          <div class="form-group">
            <label class="form-label">Fecha</label>
            <input class="form-control" type="date" formControlName="fecha" [attr.max]="today">
          </div>
          <div class="form-group">
            <label class="form-label">Motivo</label>
            <input class="form-control" type="text" maxlength="255" formControlName="motivoConsulta">
          </div>
          <div class="form-group">
            <label class="form-label">Diagnóstico</label>
            <textarea class="form-control" rows="3" maxlength="2000" formControlName="diagnostico"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Tratamiento</label>
            <textarea class="form-control" rows="3" maxlength="2000" formControlName="tratamiento"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Observaciones</label>
            <textarea class="form-control" rows="2" maxlength="2000" formControlName="observaciones"></textarea>
          </div>

          <button class="btn btn-primary" type="submit" [disabled]="editForm.invalid || saving">
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </form>

        <ng-template #noRecords>
          <div class="empty-state">
            <div class="icon">📁</div>
            <h3>Sin historial médico</h3>
            <p>El paciente no tiene consultas registradas previas.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .record-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .edit-panel {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--gray-200);
    }
  `]
})
export class VerExpedienteComponent implements OnInit {
  patient: any = null;
  records: any[] = [];
  loading = true;
  error = '';
  success = '';
  patientId = '';
  editingRecord: any = null;
  saving = false;
  deletingId: number | null = null;
  editForm: FormGroup;
  today = new Date().toISOString().split('T')[0];

  constructor(private route: ActivatedRoute, private api: ApiService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      fecha: ['', Validators.required],
      motivoConsulta: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      diagnostico: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(2000)]],
      tratamiento: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(2000)]],
      observaciones: ['', Validators.maxLength(2000)],
    });
  }

  ngOnInit() {
    this.patientId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.patientId) {
      this.error = 'No se proporcionó un ID de paciente válido';
      this.loading = false;
      return;
    }

    this.loadExpediente();
  }

  loadExpediente() {
    this.loading = true;
    this.error = '';

    this.api.getPatient(this.patientId).subscribe({
      next: (p) => {
        this.patient = p;
        this.api.getHistorialPaciente(Number(this.patientId)).subscribe({
          next: (recs) => {
            this.records = recs;
            this.loading = false;
          },
          error: (err) => {
            if (err.status === 403 || err.status === 401) {
              this.error = 'No tienes permiso o el token es inválido para ver este expediente.';
            } else {
              this.error = 'Error cargando historial del paciente';
            }
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'El paciente no existe o no tienes acceso a él.';
        this.loading = false;
      }
    });
  }

  startEdit(record: any) {
    this.success = '';
    this.error = '';
    this.editingRecord = record;
    this.editForm.reset({
      fecha: this.toDateInput(record.fecha),
      motivoConsulta: record.motivo || '',
      diagnostico: record.diagnostico || '',
      tratamiento: record.tratamiento || '',
      observaciones: record.observaciones || '',
    });
  }

  cancelEdit() {
    this.editingRecord = null;
    this.editForm.reset();
  }

  saveEdit() {
    if (!this.editingRecord || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';

    this.api.updateMedicalRecord(this.editingRecord.id, this.editForm.value).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Consulta actualizada correctamente.';
        this.cancelEdit();
        this.loadExpediente();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || 'No se pudo actualizar la consulta.';
      }
    });
  }

  deleteRecord(recordId: number) {
    if (!confirm('¿Eliminar esta consulta del expediente? Esta acción no se puede deshacer.')) return;

    this.deletingId = recordId;
    this.error = '';
    this.success = '';

    this.api.deleteMedicalRecord(recordId).subscribe({
      next: () => {
        this.deletingId = null;
        this.success = 'Consulta eliminada correctamente.';
        if (this.editingRecord?.id === recordId) this.cancelEdit();
        this.loadExpediente();
      },
      error: (err) => {
        this.deletingId = null;
        this.error = err?.error?.message || 'No se pudo eliminar la consulta.';
      }
    });
  }

  private toDateInput(value: string) {
    if (!value) return new Date().toISOString().split('T')[0];
    return new Date(value).toISOString().split('T')[0];
  }
}
