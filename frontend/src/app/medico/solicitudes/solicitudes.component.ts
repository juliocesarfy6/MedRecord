import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Solicitudes de Pacientes</h1>
      <p>Acepta pacientes antes de que puedan agendar contigo o enviarte tokens.</p>
    </div>

    <div class="card">
      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>
      <div class="alert alert-error" *ngIf="error">{{ error }}</div>
      <div class="alert alert-success" *ngIf="success">{{ success }}</div>

      <div class="table-container" *ngIf="!loading && requests.length > 0">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Mensaje</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let request of requests">
              <td>{{ request.patient?.user?.nombre || 'Paciente' }}</td>
              <td>{{ request.message || 'Sin mensaje' }}</td>
              <td><span class="badge" [ngClass]="statusClass(request.status)">{{ statusLabel(request.status) }}</span></td>
              <td>{{ request.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <div class="actions" *ngIf="request.status === 'pendiente'">
                  <button class="btn btn-success btn-sm" type="button" (click)="accept(request.id)">Aceptar</button>
                  <button class="btn btn-danger btn-sm" type="button" (click)="reject(request.id)">Rechazar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && requests.length === 0" class="empty-state">
        <div class="icon">🤝</div>
        <h3>Sin solicitudes</h3>
        <p>Cuando un paciente quiera vincularse contigo aparecerá aquí.</p>
      </div>
    </div>
  `,
  styles: [`.actions { display: flex; gap: 8px; flex-wrap: wrap; }`],
})
export class SolicitudesComponent implements OnInit {
  requests: any[] = [];
  loading = true;
  error = '';
  success = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.getDoctorLinkRequests().pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (requests) => this.requests = requests,
      error: () => this.error = 'No se pudieron cargar las solicitudes.',
    });
  }

  accept(id: number) {
    this.api.acceptDoctorLinkRequest(id).subscribe({
      next: () => {
        this.success = 'Solicitud aceptada.';
        this.load();
      },
      error: () => this.error = 'No se pudo aceptar la solicitud.',
    });
  }

  reject(id: number) {
    const responseMessage = prompt('Motivo de rechazo (opcional):') || undefined;
    this.api.rejectDoctorLinkRequest(id, responseMessage).subscribe({
      next: () => {
        this.success = 'Solicitud rechazada.';
        this.load();
      },
      error: () => this.error = 'No se pudo rechazar la solicitud.',
    });
  }

  statusLabel(status: string) {
    const labels: Record<string, string> = { pendiente: 'Pendiente', aceptada: 'Aceptada', rechazada: 'Rechazada' };
    return labels[status] || status;
  }

  statusClass(status: string) {
    return {
      'badge-warning': status === 'pendiente',
      'badge-success': status === 'aceptada',
      'badge-danger': status === 'rechazada',
    };
  }
}
