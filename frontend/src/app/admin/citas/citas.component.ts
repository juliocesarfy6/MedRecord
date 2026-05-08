import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Supervisión de Citas</h1>
      <p>Consulta las citas del sistema por médico, paciente y estado.</p>
    </div>

    <div class="alert alert-error" *ngIf="error">{{ error }}</div>

    <div class="card">
      <div class="card-header filters">
        <h2 class="card-title">Citas registradas</h2>
        <div class="filter-controls">
          <select [(ngModel)]="status" (ngModelChange)="loadAppointments()">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="reprogramada">Reprogramadas</option>
            <option value="cancelada">Canceladas</option>
            <option value="completada">Completadas</option>
          </select>
          <input type="search" [(ngModel)]="search" placeholder="Buscar médico o paciente">
        </div>
      </div>

      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>

      <div class="table-container" *ngIf="!loading && filteredAppointments.length > 0">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Motivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let appointment of filteredAppointments">
              <td>{{ appointment.fechaHoraInicio | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ appointment.patient?.user?.nombre || 'Paciente' }}</td>
              <td>{{ appointment.doctor?.user?.nombre || 'Médico' }}</td>
              <td>{{ appointment.motivo }}</td>
              <td><span class="badge" [ngClass]="statusClass(appointment.estado)">{{ statusLabel(appointment.estado) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && filteredAppointments.length === 0" class="empty-state">
        <div class="icon">🗓️</div>
        <h3>Sin citas para mostrar</h3>
        <p>Cuando existan citas que coincidan con los filtros aparecerán aquí.</p>
      </div>
    </div>
  `,
  styles: [`
    .filters { align-items: center; gap: 12px; }
    .filter-controls { display: flex; gap: 10px; flex-wrap: wrap; }
    select, input {
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 10px 12px;
      font: inherit;
      min-width: 220px;
    }
    @media (max-width: 768px) {
      .filter-controls, select, input { width: 100%; min-width: 0; }
    }
  `]
})
export class CitasComponent implements OnInit {
  appointments: any[] = [];
  status = '';
  search = '';
  loading = true;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadAppointments();
  }

  get filteredAppointments() {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.appointments;
    return this.appointments.filter((appointment) => {
      const patient = appointment.patient?.user?.nombre?.toLowerCase() || '';
      const doctor = appointment.doctor?.user?.nombre?.toLowerCase() || '';
      return patient.includes(term) || doctor.includes(term);
    });
  }

  loadAppointments() {
    this.loading = true;
    this.error = '';
    this.api.getAdminAppointments(this.status || undefined).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (appointments) => this.appointments = appointments,
      error: () => this.error = 'No se pudieron cargar las citas.',
    });
  }

  statusLabel(status: string) {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      reprogramada: 'Reprogramada',
      cancelada: 'Cancelada',
      completada: 'Completada',
    };
    return labels[status] || status;
  }

  statusClass(status: string) {
    const classes: Record<string, string> = {
      pendiente: 'badge-warning',
      confirmada: 'badge-primary',
      reprogramada: 'badge-info',
      cancelada: 'badge-danger',
      completada: 'badge-success',
    };
    return classes[status] || 'badge-primary';
  }
}
