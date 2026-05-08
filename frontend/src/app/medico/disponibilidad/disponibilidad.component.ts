import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

interface AvailabilityRow {
  diaSemana: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

@Component({
  selector: 'app-disponibilidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Disponibilidad</h1>
      <p>Configura los horarios en los que los pacientes pueden agendar citas.</p>
    </div>

    <div class="alert alert-error" *ngIf="error">{{ error }}</div>
    <div class="alert alert-success" *ngIf="success">{{ success }}</div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Horarios semanales</h2>
      </div>

      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>

      <div class="availability-list" *ngIf="!loading">
        <div class="availability-row" *ngFor="let row of rows">
          <label class="day-toggle">
            <input type="checkbox" [(ngModel)]="row.activo">
            <span>{{ row.dia }}</span>
          </label>
          <input type="time" [(ngModel)]="row.horaInicio" [disabled]="!row.activo">
          <span class="separator">a</span>
          <input type="time" [(ngModel)]="row.horaFin" [disabled]="!row.activo">
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" type="button" [disabled]="saving || loading" (click)="save()">
          {{ saving ? 'Guardando...' : 'Guardar disponibilidad' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .availability-list { display: flex; flex-direction: column; gap: 12px; }
    .availability-row {
      display: grid;
      grid-template-columns: minmax(160px, 1fr) 150px 24px 150px;
      gap: 12px;
      align-items: center;
      padding: 12px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
    }
    .day-toggle { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #0F172A; }
    input[type="time"] {
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 10px 12px;
      font: inherit;
    }
    .separator { color: #64748B; text-align: center; }
    .actions { display: flex; justify-content: flex-end; margin-top: 20px; }
    @media (max-width: 768px) {
      .availability-row { grid-template-columns: 1fr; }
      .separator { text-align: left; }
      .actions .btn { width: 100%; }
    }
  `]
})
export class DisponibilidadComponent implements OnInit {
  rows: AvailabilityRow[] = [
    { diaSemana: 1, dia: 'Lunes', horaInicio: '09:00', horaFin: '17:00', activo: true },
    { diaSemana: 2, dia: 'Martes', horaInicio: '09:00', horaFin: '17:00', activo: true },
    { diaSemana: 3, dia: 'Miércoles', horaInicio: '09:00', horaFin: '17:00', activo: true },
    { diaSemana: 4, dia: 'Jueves', horaInicio: '09:00', horaFin: '17:00', activo: true },
    { diaSemana: 5, dia: 'Viernes', horaInicio: '09:00', horaFin: '17:00', activo: true },
    { diaSemana: 6, dia: 'Sábado', horaInicio: '09:00', horaFin: '13:00', activo: false },
    { diaSemana: 0, dia: 'Domingo', horaInicio: '09:00', horaFin: '13:00', activo: false },
  ];
  loading = true;
  saving = false;
  error = '';
  success = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.api.getMyAvailability().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (items) => {
        for (const row of this.rows) {
          const saved = items.find((item) => item.diaSemana === row.diaSemana);
          if (saved) {
            row.horaInicio = this.normalizeTime(saved.horaInicio);
            row.horaFin = this.normalizeTime(saved.horaFin);
            row.activo = saved.activo;
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar tu disponibilidad actual.';
        this.cdr.detectChanges();
      },
    });
  }

  save() {
    const invalid = this.rows.some((row) => row.activo && row.horaInicio >= row.horaFin);
    if (invalid) {
      this.error = 'Revisa tus horarios: la hora inicial debe ser menor a la hora final.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';

    const items = this.rows.map((row) => ({
      diaSemana: row.diaSemana,
      horaInicio: row.horaInicio,
      horaFin: row.horaFin,
      activo: row.activo,
    }));

    this.api.updateMyAvailability(items).pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.success = 'Disponibilidad guardada correctamente.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo guardar la disponibilidad.';
        this.cdr.detectChanges();
      },
    });
  }

  private normalizeTime(value: string) {
    return (value || '').slice(0, 5);
  }
}
