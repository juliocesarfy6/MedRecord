import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-buscar-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Buscar Médicos</h1>
      <p>Solicita vincularte con un médico antes de agendar citas o compartir tokens.</p>
    </div>

    <div class="card">
      <div class="search-row">
        <input class="form-control" [(ngModel)]="search" placeholder="Buscar por nombre, especialidad o cédula">
        <button class="btn btn-primary" type="button" (click)="load()">Buscar</button>
      </div>

      <div class="alert alert-error" *ngIf="error">{{ error }}</div>
      <div class="alert alert-success" *ngIf="success">{{ success }}</div>
      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>

      <div class="doctor-grid" *ngIf="!loading && doctors.length > 0">
        <article class="doctor-card" *ngFor="let doctor of doctors">
          <div>
            <h3>{{ doctor.nombre }}</h3>
            <p>{{ doctor.especialidad || 'Medicina general' }}</p>
            <span>Cédula: {{ doctor.cedulaProfesional || 'N/D' }}</span>
          </div>
          <div class="card-actions">
            <span class="badge" [ngClass]="statusClass(doctor.link?.status)">
              {{ statusLabel(doctor.link?.status) }}
            </span>
            <button
              class="btn btn-primary btn-sm"
              type="button"
              *ngIf="!doctor.link || doctor.link.status === 'rechazada'"
              [disabled]="requestingId === doctor.id"
              (click)="requestLink(doctor)">
              {{ requestingId === doctor.id ? 'Enviando...' : 'Solicitar vínculo' }}
            </button>
          </div>
        </article>
      </div>

      <div *ngIf="!loading && doctors.length === 0" class="empty-state">
        <div class="icon">🔎</div>
        <h3>No se encontraron médicos</h3>
        <p>Intenta con otro nombre o especialidad.</p>
      </div>
    </div>
  `,
  styles: [`
    .search-row { display: grid; grid-template-columns: 1fr auto; gap: 12px; margin-bottom: 20px; }
    .doctor-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    .doctor-card { border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
    .doctor-card h3 { font-size: 17px; margin: 0 0 4px; color: #0F172A; }
    .doctor-card p { color: #334155; margin: 0 0 4px; }
    .doctor-card span { color: #64748B; font-size: 13px; }
    .card-actions { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    @media (max-width: 640px) { .search-row { grid-template-columns: 1fr; } }
  `],
})
export class BuscarMedicosComponent implements OnInit {
  doctors: any[] = [];
  search = '';
  loading = true;
  requestingId: number | null = null;
  error = '';
  success = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.searchDoctors(this.search).pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (doctors) => this.doctors = doctors,
      error: () => this.error = 'No se pudieron cargar los médicos.',
    });
  }

  requestLink(doctor: any) {
    const message = prompt('Mensaje para el médico (opcional):', 'Me gustaría vincularme para agendar citas y compartir mi expediente cuando sea necesario.');
    this.requestingId = doctor.id;
    this.error = '';
    this.success = '';
    this.api.requestDoctorLink(doctor.id, message || undefined).pipe(finalize(() => {
      this.requestingId = null;
      this.cdr.detectChanges();
    })).subscribe({
      next: () => {
        this.success = 'Solicitud enviada correctamente.';
        this.load();
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo enviar la solicitud.';
      },
    });
  }

  statusLabel(status?: string) {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      aceptada: 'Vinculado',
      rechazada: 'Rechazado',
    };
    return status ? labels[status] || status : 'Sin vínculo';
  }

  statusClass(status?: string) {
    return {
      'badge-warning': status === 'pendiente',
      'badge-success': status === 'aceptada',
      'badge-danger': status === 'rechazada',
      'badge-info': !status,
    };
  }
}
