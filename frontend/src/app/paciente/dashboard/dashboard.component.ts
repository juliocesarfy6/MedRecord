import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Hola, {{ profile?.user?.nombre || 'Paciente' }} 👋</h1>
      <p>Bienvenido a tu panel de control de salud.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(37, 99, 235, 0.1); color: #2563EB;">📋</div>
        <div class="stat-info">
          <h3>{{ stats.records }}</h3>
          <p>Consultas Registradas</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: #10B981;">🔐</div>
        <div class="stat-info">
          <h3>{{ stats.activeTokens }}</h3>
          <p>Tokens Activos</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: #F59E0B;">👁️</div>
        <div class="stat-info">
          <h3>{{ stats.recentViews }}</h3>
          <p>Accesos Recientes</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Últimas Consultas Médicas</h2>
        </div>
        <div class="table-container" *ngIf="recentRecords.length > 0; else noRecords">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Médico</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rec of recentRecords">
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
        <div class="table-container" *ngIf="activeTokensList.length > 0; else noTokens">
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Vence</th>
                <th>Clase</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tk of activeTokensList">
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
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    @media (max-width: 1024px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  profile: any = null;
  recentRecords: any[] = [];
  activeTokensList: any[] = [];
  stats = { records: 0, activeTokens: 0, recentViews: 0 };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getMyPatientProfile().subscribe(p => this.profile = p);
    
    this.api.getMyMedicalRecords().subscribe(res => {
      this.stats.records = res.length;
      this.recentRecords = res.slice(0, 5);
    });

    this.api.getMyTokens().subscribe(res => {
      const active = res.filter(t => t.estado === 'activo');
      this.stats.activeTokens = active.length;
      this.activeTokensList = active.slice(0, 5);
    });

    this.api.getMyAuditLogs().subscribe(res => {
      this.stats.recentViews = res.filter(log => log.accion === 'VER_EXPEDIENTE').length;
    });
  }
}
