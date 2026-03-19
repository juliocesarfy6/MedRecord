import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Registro de Auditoría</h1>
      <p>Monitorea quién ha accedido a tu historial clínico y cuándo.</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Eventos Recientes de Acceso</h2>
      </div>

      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>

      <div class="table-container" *ngIf="!loading && logs.length > 0">
        <table>
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Acción Realizada</th>
              <th>Recurso Afectado</th>
              <th>IP de Origen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of logs">
              <td>{{ log.fecha | date:'dd/MM/yyyy HH:mm:ss' }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-primary': log.accion === 'VER_EXPEDIENTE',
                  'badge-success': log.accion === 'REGISTRO_CONSULTA',
                  'badge-warning': log.accion === 'GENERAR_TOKEN'
                }">
                  {{ log.accion }}
                </span>
              </td>
              <td>{{ log.recurso || '-' }}</td>
              <td style="font-family: monospace; color: var(--gray-500);">{{ log.ip || 'Local/Conocida' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && logs.length === 0" class="empty-state">
        <div class="icon">🛡️</div>
        <h3>Sin reportes recientes</h3>
        <p>No se encontraron registros de auditoría vinculados a tu cuenta.</p>
      </div>
    </div>
  `
})
export class AuditoriaComponent implements OnInit {
  logs: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getMyAuditLogs().subscribe({
      next: (res) => {
        this.logs = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
