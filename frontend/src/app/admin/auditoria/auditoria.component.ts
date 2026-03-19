import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

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
              <td><span style="font-family: monospace; font-size: 11px;">{{ log.pacienteId ? log.pacienteId.split('-')[0] : 'N/A' }}</span></td>
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

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getAllAuditLogs().subscribe({
      next: (res) => { this.logs = res; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
