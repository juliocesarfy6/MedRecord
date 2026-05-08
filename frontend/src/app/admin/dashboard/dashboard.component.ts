import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { catchError, finalize, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Panel de Administración Global</h1>
      <p>Vista general del sistema, usuarios y actividades.</p>
    </div>

    <div class="alert alert-error" *ngIf="error">{{ error }}</div>
    <div class="alert alert-warning" *ngIf="warning">{{ warning }}</div>
    <div class="alert alert-info" *ngIf="loading">Actualizando métricas del sistema...</div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(37, 99, 235, 0.1); color: #2563EB;">👥</div>
        <div class="stat-info">
          <h3>{{ stats.users }}</h3>
          <p>Usuarios Totales</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: #10B981;">🧑‍⚕️</div>
        <div class="stat-info">
          <h3>{{ stats.patients }}</h3>
          <p>Pacientes Registrados</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B;">👨‍⚕️</div>
        <div class="stat-info">
          <h3>{{ stats.doctors }}</h3>
          <p>Médicos Aprobados</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(239, 68, 68, 0.1); color: #EF4444;">🛡️</div>
        <div class="stat-info">
          <h3>{{ stats.auditEvents }}</h3>
          <p>Eventos Auditados</p>
        </div>
      </div>
    </div>

    <!-- Active Audit Logs Preview -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Eventos Recientes del Sistema</h2>
      </div>

      <div class="table-container" *ngIf="recentLogs.length > 0; else noLogs">
        <table>
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Acción</th>
              <th>IP Origen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of recentLogs">
              <td>{{ log.fecha | date:'dd/MM/yyyy HH:mm:ss' }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-primary': log.accion === 'VER_EXPEDIENTE',
                  'badge-success': log.accion === 'REGISTRO_CONSULTA',
                  'badge-warning': log.accion === 'GENERAR_TOKEN'
                }">{{ log.accion }}</span>
              </td>
              <td><span style="font-family: monospace; color: var(--gray-500);">{{ log.ip || '-' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #noLogs>
        <div class="empty-state">
          <div class="icon">🛡️</div>
          <h3>Sin eventos recientes</h3>
          <p>Cuando haya actividad en el sistema aparecerá aquí.</p>
        </div>
      </ng-template>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats = { users: 0, patients: 0, doctors: 0, auditEvents: 0 };
  recentLogs: any[] = [];
  loading = true;
  error = '';
  warning = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loading = true;
    this.error = '';
    this.warning = '';

    forkJoin({
      users: this.api.getAllUsers().pipe(catchError(() => {
        this.warning = 'Algunas métricas no se pudieron cargar. Revisa que el backend esté activo y vuelve a intentar.';
        return of([]);
      })),
      patients: this.api.getAllPatients().pipe(catchError(() => {
        this.warning = 'Algunas métricas no se pudieron cargar. Revisa que el backend esté activo y vuelve a intentar.';
        return of([]);
      })),
      logs: this.api.getAllAuditLogs().pipe(catchError(() => {
        this.warning = 'Algunas métricas no se pudieron cargar. Revisa que el backend esté activo y vuelve a intentar.';
        return of([]);
      })),
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({ users, patients, logs }) => {
        this.stats = {
          users: users.length,
          patients: patients.length,
          doctors: users.filter(u => u.role === 'medico' && u.status === 'activo').length,
          auditEvents: logs.length,
        };
        this.recentLogs = logs.slice(0, 5);
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo cargar el panel administrativo.';
      },
    });
  }
}
