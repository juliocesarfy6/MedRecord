import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Auditoría Global</h1>
      <p>Log de eventos de sistema con trazabilidad inalterable de lecturas y modificaciones.</p>
    </div>

    <div class="card">
      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>
      <div class="alert alert-error" *ngIf="error">{{ error }}</div>

      <div class="table-container" *ngIf="!loading && logs.length > 0">
        <table>
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Usuario (Actor)</th>
              <th>Acción Realizada</th>
              <th>Paciente (Objetivo)</th>
              <th>IP Origen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of logs">
              <td>{{ log.fecha | date:'dd/MM/yyyy HH:mm:ss' }}</td>
              <td>
                <div style="font-size: 13px; font-weight: 600;">{{ log.user?.nombre || 'Sistema / Anon' }}</div>
                <div style="font-size: 11px; color: var(--gray-400);">{{ log.user?.email }}</div>
              </td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-primary': log.accion === 'VER_EXPEDIENTE',
                  'badge-success': log.accion === 'REGISTRO_CONSULTA',
                  'badge-warning': log.accion === 'GENERAR_TOKEN'
                }">{{ log.accion }}</span>
              </td>
              <td><span style="font-family: monospace; font-size: 11px;">{{ log.patientId ? ('#' + log.patientId) : 'N/A' }}</span></td>
              <td><span style="font-family: monospace; font-size: 12px; color: var(--gray-500);">{{ log.ip || '-' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && logs.length === 0" class="empty-state">
        <div class="icon">🛡️</div>
        <h3>No hay eventos</h3>
      </div>
    </div>
  `
})
export class AuditoriaComponent implements OnInit {
  logs: any[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const loadingGuard = window.setTimeout(() => {
      if (!this.loading) return;
      this.error = 'La carga está tardando demasiado. Recarga la vista o revisa el backend.';
      this.loading = false;
      this.cdr.detectChanges();
    }, 7000);

    this.api.getAllAuditLogs().pipe(
      finalize(() => {
        window.clearTimeout(loadingGuard);
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => { this.logs = res; },
      error: () => {
        this.error = 'No se pudo cargar la auditoría. Revisa que el backend esté activo.';
      }
    });
  }
}
