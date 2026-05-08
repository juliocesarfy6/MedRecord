import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Mis Citas</h1>
      <p>Historial de citas médicas solicitadas y confirmadas.</p>
    </div>

    <div class="alert alert-error" *ngIf="error">{{ error }}</div>
    <div class="alert alert-success" *ngIf="success">{{ success }}</div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Historial de citas</h2>
        <a class="btn btn-primary btn-sm" routerLink="/paciente/citas/nueva">Agendar cita</a>
      </div>

      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>

      <div class="table-container" *ngIf="!loading && appointments.length > 0">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Médico</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let appointment of appointments">
              <td>{{ appointment.fechaHoraInicio | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ appointment.doctor?.user?.nombre || 'Médico' }}</td>
              <td>{{ appointment.motivo }}</td>
              <td><span class="badge" [ngClass]="statusClass(appointment.estado)">{{ statusLabel(appointment.estado) }}</span></td>
              <td>
                <button
                  class="btn btn-danger btn-sm"
                  *ngIf="canCancel(appointment)"
                  [disabled]="cancellingId === appointment.id"
                  (click)="cancel(appointment.id)">
                  {{ cancellingId === appointment.id ? 'Cancelando...' : 'Cancelar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && appointments.length === 0" class="empty-state">
        <div class="icon">🗓️</div>
        <h3>Aún no tienes citas</h3>
        <p>Agenda una cita con un médico disponible cuando necesites atención.</p>
      </div>
    </div>
  `
})
export class CitasComponent implements OnInit {
  appointments: any[] = [];
  loading = true;
  error = '';
  success = '';
  cancellingId: number | null = null;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.error = '';
    this.api.getMyAppointments().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar tus citas.';
        this.cdr.detectChanges();
      },
    });
  }

  cancel(id: number) {
    if (!confirm('¿Deseas cancelar esta cita?')) return;
    this.cancellingId = id;
    this.error = '';
    this.success = '';

    this.api.cancelAppointment(id, 'Cancelada por el paciente').pipe(
      finalize(() => {
        this.cancellingId = null;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.success = 'Cita cancelada correctamente.';
        this.loadAppointments();
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo cancelar la cita.';
        this.cdr.detectChanges();
      },
    });
  }

  canCancel(appointment: any) {
    return ['pendiente', 'confirmada', 'reprogramada'].includes(appointment.estado);
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
