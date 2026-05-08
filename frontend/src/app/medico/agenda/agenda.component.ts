import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Agenda Médica</h1>
      <p>Confirma, reprograma o completa las citas asignadas a tu perfil.</p>
    </div>

    <div class="alert alert-error" *ngIf="error">{{ error }}</div>
    <div class="alert alert-success" *ngIf="success">{{ success }}</div>

    <div class="card">
      <div class="card-header filter-header">
        <h2 class="card-title">Citas</h2>
        <div class="date-filter">
          <input type="date" [(ngModel)]="date" (change)="loadAppointments()">
          <button class="btn btn-secondary btn-sm" type="button" (click)="clearDate()">Todas</button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>

      <div class="table-container" *ngIf="!loading && appointments.length > 0">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Reprogramar</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let appointment of appointments">
              <td>{{ appointment.fechaHoraInicio | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ appointment.patient?.user?.nombre || 'Paciente' }}</td>
              <td>{{ appointment.motivo }}</td>
              <td><span class="badge" [ngClass]="statusClass(appointment.estado)">{{ statusLabel(appointment.estado) }}</span></td>
              <td>
                <div class="inline-reschedule" *ngIf="canManage(appointment)">
                  <input type="datetime-local" [(ngModel)]="rescheduleValues[appointment.id]">
                  <button class="btn btn-secondary btn-sm" type="button" (click)="reschedule(appointment.id)">Guardar</button>
                </div>
              </td>
              <td>
                <div class="row-actions">
                  <button class="btn btn-primary btn-sm" type="button" *ngIf="canConfirm(appointment)" (click)="confirmAppointment(appointment.id)">Confirmar</button>
                  <button class="btn btn-success btn-sm" type="button" *ngIf="canManage(appointment)" (click)="complete(appointment.id)">Completar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && appointments.length === 0" class="empty-state">
        <div class="icon">🗓️</div>
        <h3>No hay citas para mostrar</h3>
        <p>Cuando un paciente agende una cita aparecerá en esta agenda.</p>
      </div>
    </div>
  `,
  styles: [`
    .filter-header { align-items: center; gap: 12px; }
    .date-filter { display: flex; gap: 8px; align-items: center; }
    input {
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 9px 10px;
      font: inherit;
    }
    .inline-reschedule { display: flex; gap: 8px; align-items: center; min-width: 260px; }
    .inline-reschedule input { min-width: 170px; }
    .row-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  `]
})
export class AgendaComponent implements OnInit {
  appointments: any[] = [];
  rescheduleValues: Record<number, string> = {};
  date = '';
  loading = true;
  error = '';
  success = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.error = '';
    this.api.getDoctorSchedule(this.date || undefined).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.rescheduleValues = {};
        for (const appointment of appointments) {
          this.rescheduleValues[appointment.id] = this.toDatetimeLocal(appointment.fechaHoraInicio);
        }
      },
      error: () => this.error = 'No se pudo cargar tu agenda.',
    });
  }

  clearDate() {
    this.date = '';
    this.loadAppointments();
  }

  confirmAppointment(id: number) {
    this.runAction(this.api.confirmAppointment(id), 'Cita confirmada correctamente.');
  }

  complete(id: number) {
    if (!confirm('¿Deseas marcar esta cita como completada?')) return;
    this.runAction(this.api.completeAppointment(id), 'Cita marcada como completada.');
  }

  reschedule(id: number) {
    const value = this.rescheduleValues[id];
    if (!value) {
      this.error = 'Selecciona la nueva fecha y hora.';
      return;
    }
    this.runAction(this.api.rescheduleAppointment(id, value), 'Cita reprogramada correctamente.');
  }

  canConfirm(appointment: any) {
    return ['pendiente', 'reprogramada'].includes(appointment.estado);
  }

  canManage(appointment: any) {
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

  private runAction(request: any, message: string) {
    this.error = '';
    this.success = '';
    request.subscribe({
      next: () => {
        this.success = message;
        this.loadAppointments();
      },
      error: (err: any) => this.error = err?.error?.message || 'No se pudo completar la acción.',
    });
  }

  private toDatetimeLocal(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
