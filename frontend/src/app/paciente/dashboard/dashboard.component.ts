import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Hola, {{ profile()?.user?.nombre || 'Paciente' }} 👋</h1>
      <p>Bienvenido a tu panel de control de salud.</p>
    </div>

    <div *ngIf="loading()" class="loading-overlay"><div class="spinner"></div></div>
    <div class="alert alert-error" *ngIf="error()">{{ error() }}</div>

    <ng-container *ngIf="!loading() && !error()">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(37, 99, 235, 0.1); color: #2563EB;">📋</div>
        <div class="stat-info">
          <h3>{{ stats().records }}</h3>
          <p>Consultas Registradas</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: #10B981;">🔐</div>
        <div class="stat-info">
          <h3>{{ stats().activeTokens }}</h3>
          <p>Tokens Activos</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B;">👁️</div>
        <div class="stat-info">
          <h3>{{ stats().recentViews }}</h3>
          <p>Accesos Recientes</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(14, 165, 233, 0.1); color: #0284C7;">🗓️</div>
        <div class="stat-info">
          <h3>{{ stats().appointments }}</h3>
          <p>Citas Activas</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Últimas Consultas Médicas</h2>
        </div>
        <div class="table-container dashboard-table-container" *ngIf="recentRecords().length > 0; else noRecords">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Médico</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rec of recentRecords()">
                <td>{{ rec.fecha | date:'dd/MM/yyyy' }}</td>
                <td>{{ rec.doctor?.nombre || 'N/A' }}</td>
                <td>{{ rec.motivo }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noRecords>
          <div class="empty-state">
            <div class="icon">📁</div>
            <h3>Sin historial médico</h3>
            <p>Aún no tienes consultas registradas en tu expediente.</p>
          </div>
        </ng-template>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Tokens de Acceso Activos</h2>
        </div>
        <div class="table-container dashboard-table-container" *ngIf="activeTokensList().length > 0; else noTokens">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Vence</th>
                <th>Clase</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tk of activeTokensList()">
                <td><span style="font-family: monospace; font-weight: 600;">{{ tk.token }}</span></td>
                <td>{{ tk.fechaExpiracion | date:'dd/MM HH:mm' }}</td>
                <td><span class="badge badge-primary">{{ tk.nivelAcceso }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noTokens>
          <div class="empty-state">
            <div class="icon">🔑</div>
            <h3>Sin tokens activos</h3>
            <p>No tienes autorizaciones vigentes compartidas con médicos.</p>
          </div>
        </ng-template>
      </div>
    </div>
    </ng-container>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      min-width: 0;
    }
    .dashboard-grid .card {
      min-width: 0;
      overflow: hidden;
    }
    .dashboard-table-container {
      width: 100%;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: thin;
    }
    .dashboard-table {
      min-width: 520px;
    }
    .dashboard-table th,
    .dashboard-table td {
      white-space: nowrap;
    }
    .dashboard-table td:last-child {
      min-width: 180px;
      white-space: normal;
    }
    @media (max-width: 1024px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 520px) {
      .dashboard-table {
        min-width: 460px;
      }
      .dashboard-table th,
      .dashboard-table td {
        padding: 10px 12px;
        font-size: 12px;
      }
      .dashboard-table td:last-child {
        min-width: 150px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  profile = signal<any>(null);
  recentRecords = signal<any[]>([]);
  activeTokensList = signal<any[]>([]);
  stats = signal({ records: 0, activeTokens: 0, recentViews: 0, appointments: 0 });
  loading = signal(true);
  error = signal('');
  private destroyRef = inject(DestroyRef);

  constructor(private api: ApiService) {}

  ngOnInit() {
    forkJoin({
      profile: this.api.getMyPatientProfile(),
      records: this.api.getMyMedicalRecords(),
      tokens: this.api.getMyTokens(),
      logs: this.api.getMyAuditLogs(),
      appointments: this.api.getMyAppointments().pipe(catchError(() => of([]))),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ profile, records, tokens, logs, appointments }) => {
        const active = tokens.filter((t: any) => t.estado === 'activo');
        const views = logs.filter((log: any) => log.accion === 'VER_EXPEDIENTE').length;
        const activeAppointments = appointments.filter((appointment: any) => ['pendiente', 'confirmada', 'reprogramada'].includes(appointment.estado)).length;

        this.profile.set(profile);
        this.recentRecords.set(records.slice(0, 5));
        this.activeTokensList.set(active.slice(0, 5));
        this.stats.set({ records: records.length, activeTokens: active.length, recentViews: views, appointments: activeAppointments });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'No se pudo cargar tu panel. Intenta de nuevo más tarde.');
        this.loading.set(false);
      }
    });
  }
}
