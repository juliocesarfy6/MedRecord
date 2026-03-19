import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ver-expediente',
  standalone: true,
  imports: [CommonModule],
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

    <div *ngIf="!loading && !error && patient" class="dashboard-grid">
      
      <!-- Patient Details Sidebar -->
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

      <!-- Medical History -->
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
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rec of records">
                <td>{{ rec.fecha | date:'dd/MM/yyyy' }}</td>
                <td>{{ rec.doctor?.nombre }}</td>
                <td>{{ rec.motivo }}</td>
                <td>{{ rec.diagnostico || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noRecords>
          <div class="empty-state">
            <div class="icon">📁</div>
            <h3>Sin historial médico</h3>
            <p>El paciente no tiene consultas registradas previas.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class VerExpedienteComponent implements OnInit {
  patient: any = null;
  records: any[] = [];
  loading = true;
  error = '';
  patientId = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.patientId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.patientId) { this.error = 'No se proporcionó un ID de paciente válido'; this.loading = false; return; }

    this.api.getPatient(this.patientId).subscribe({
      next: (p) => {
        this.patient = p;
        this.api.getPatientRecords(this.patientId).subscribe({
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
}
