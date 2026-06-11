import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

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
                    <button class="btn btn-outline btn-sm" (click)="printPrescription(rec)">Imprimir receta</button>
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

  constructor(private route: ActivatedRoute, private api: ApiService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
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
      this.cdr.detectChanges();
      return;
    }

    this.loadExpediente();
  }

  loadExpediente() {
    this.loading = true;
    this.error = '';

    const loadingGuard = window.setTimeout(() => {
      if (!this.loading) return;
      this.error = 'La carga está tardando demasiado. Revisa que el token siga vigente o recarga la vista.';
      this.loading = false;
      this.cdr.detectChanges();
    }, 7000);

    forkJoin({
      patient: this.api.getPatient(this.patientId),
      records: this.api.getHistorialPaciente(Number(this.patientId)),
    }).pipe(
      finalize(() => {
        window.clearTimeout(loadingGuard);
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: ({ patient, records }) => {
        this.patient = patient;
        this.records = records;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 403 || err.status === 401) {
          this.error = 'No tienes permiso o el token es inválido para ver este expediente.';
        } else if (err.status === 404) {
          this.error = 'El paciente no existe o no tienes acceso a él.';
        } else {
          this.error = 'Error cargando expediente del paciente.';
        }
        this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  cancelEdit() {
    this.editingRecord = null;
    this.editForm.reset();
    this.cdr.detectChanges();
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
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      }
    });
  }

  private toDateInput(value: string) {
    if (!value) return new Date().toISOString().split('T')[0];
    return new Date(value).toISOString().split('T')[0];
  }

  printPrescription(record: any) {
    if (!this.patient) return;

    const printableWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printableWindow) {
      this.error = 'No se pudo abrir la ventana de impresión. Permite ventanas emergentes para imprimir la receta.';
      this.cdr.detectChanges();
      return;
    }

    printableWindow.document.open();
    printableWindow.document.write(this.buildPrescriptionHtml(record, this.patient));
    printableWindow.document.close();
    printableWindow.focus();
    printableWindow.setTimeout(() => {
      printableWindow.print();
    }, 250);
  }

  private buildPrescriptionHtml(record: any, patient: any) {
    const patientName = this.escapeHtml(patient.user?.nombre || 'Paciente');
    const doctorName = this.escapeHtml(record.doctor?.user?.nombre || 'Médico tratante');
    const doctorSpecialty = this.escapeHtml(record.doctor?.especialidad || '');
    const doctorLicense = this.escapeHtml(record.doctor?.cedulaProfesional || '');
    const date = this.formatPrintableDate(record.fecha);

    return `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receta MedRecord</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 32px; }
          .document { max-width: 760px; margin: 0 auto; border: 1px solid #dbe3ef; padding: 28px; }
          .header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #1d4ed8; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 24px; font-weight: 800; color: #1e3a8a; }
          .subtitle { color: #64748b; margin-top: 4px; }
          .meta { text-align: right; color: #334155; font-size: 13px; line-height: 1.5; }
          .section { margin-top: 20px; }
          .section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
          .label { color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 700; }
          .value { font-size: 15px; margin-top: 3px; white-space: pre-wrap; }
          .block { min-height: 70px; line-height: 1.55; white-space: pre-wrap; }
          .footer { display: grid; grid-template-columns: 1fr 240px; gap: 24px; margin-top: 60px; align-items: end; }
          .signature { border-top: 1px solid #0f172a; text-align: center; padding-top: 8px; font-size: 13px; }
          .fine-print { color: #64748b; font-size: 11px; line-height: 1.4; }
          @media print {
            body { padding: 0; }
            .document { border: 0; padding: 18mm; max-width: none; }
          }
        </style>
      </head>
      <body>
        <main class="document">
          <header class="header">
            <div>
              <div class="brand">MedRecord</div>
              <div class="subtitle">Receta e indicaciones de consulta</div>
            </div>
            <div class="meta">
              <strong>Fecha:</strong> ${date}<br>
              <strong>Consulta:</strong> #${this.escapeHtml(String(record.id || ''))}
            </div>
          </header>

          <section class="section">
            <h2>Paciente</h2>
            <div class="grid">
              <div><div class="label">Nombre</div><div class="value">${patientName}</div></div>
              <div><div class="label">CURP</div><div class="value">${this.escapeHtml(patient.curp || 'No registrada')}</div></div>
              <div><div class="label">Fecha de nacimiento</div><div class="value">${this.formatPrintableDate(patient.fechaNacimiento)}</div></div>
              <div><div class="label">Alergias</div><div class="value">${this.escapeHtml(patient.alergias || 'Ninguna conocida')}</div></div>
            </div>
          </section>

          <section class="section">
            <h2>Médico</h2>
            <div class="grid">
              <div><div class="label">Nombre</div><div class="value">Dr. ${doctorName}</div></div>
              <div><div class="label">Especialidad</div><div class="value">${doctorSpecialty || 'No especificada'}</div></div>
              <div><div class="label">Cédula profesional</div><div class="value">${doctorLicense || 'No registrada'}</div></div>
            </div>
          </section>

          <section class="section">
            <h2>Motivo de consulta</h2>
            <div class="block">${this.escapeHtml(record.motivo || 'No especificado')}</div>
          </section>

          <section class="section">
            <h2>Diagnóstico</h2>
            <div class="block">${this.escapeHtml(record.diagnostico || 'No especificado')}</div>
          </section>

          <section class="section">
            <h2>Tratamiento, medicamentos e indicaciones</h2>
            <div class="block">${this.escapeHtml(record.tratamiento || 'No especificado')}</div>
          </section>

          <footer class="footer">
            <div class="fine-print">
              Documento generado desde MedRecord. Esta impresión corresponde a la consulta registrada en el expediente clínico.
            </div>
            <div class="signature">Firma del médico</div>
          </footer>
        </main>
      </body>
      </html>
    `;
  }

  private formatPrintableDate(value: string | Date) {
    if (!value) return 'No registrada';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No registrada';
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private escapeHtml(value: string) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
