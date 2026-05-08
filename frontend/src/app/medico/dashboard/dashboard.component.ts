import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-medico-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Panel Médico</h1>
      <p>Bienvenido Dr(a). {{ auth.currentUser?.nombre }}</p>
    </div>

    <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>
    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <ng-container *ngIf="!loading && !error">
    <!-- Active/Pending Alert -->
    <div *ngIf="status === 'pendiente'" class="alert alert-warning" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); color: #B45309; padding: 20px;">
      <h3 style="margin-bottom: 8px;">Cuenta Pendiente de Aprobación</h3>
      <p>Tu cuenta como profesional de la salud está siendo validada por los administradores. Algunas funciones pueden estar restringidas hasta que se apruebe tu perfil.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(37, 99, 235, 0.1); color: #2563EB;">🔓</div>
        <div class="stat-info">
          <h3>{{ authorizedPatients.length }}</h3>
          <p>Pacientes con acceso vigente</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
      
      <div class="card" style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔑</div>
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Validar Acceso</h2>
        <p style="color: var(--gray-500); margin-bottom: 24px;">Solicita el token a tu paciente para poder visualizar su historial médico electrónico.</p>
        <a routerLink="/medico/validar-token" class="btn btn-primary btn-lg">Validar Token</a>
      </div>

      <div class="card" style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Registrar Consulta</h2>
        <p style="color: var(--gray-500); margin-bottom: 24px;">Añade nuevas notas, diagnósticos y tratamientos al expediente de tus pacientes.</p>
        <a routerLink="/medico/registrar-consulta" class="btn btn-outline btn-lg">Registrar Consulta</a>
      </div>

    </div>
    </ng-container>
  `
})
export class DashboardComponent implements OnInit {
  status = '';
  authorizedPatients: any[] = [];
  loading = true;
  error = '';

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.status = this.auth.currentUser?.status || '';
    this.api.getAuthorizedPatients().subscribe({
      next: (patients) => {
        this.authorizedPatients = patients;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo cargar el panel médico.';
        this.loading = false;
      }
    });
  }
}
