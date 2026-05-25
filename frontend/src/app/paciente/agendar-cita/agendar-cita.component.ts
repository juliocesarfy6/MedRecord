import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Agendar Cita Médica</h1>
      <p>Reserva un bloque de atención con médicos que aceptaron vincularse contigo.</p>
    </div>

    <div class="alert alert-error" *ngIf="error">{{ error }}</div>
    <div class="alert alert-success" *ngIf="success">{{ success }}</div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Nueva cita</h2>
        <a class="btn btn-secondary btn-sm" routerLink="/paciente/citas">Ver mis citas</a>
      </div>

      <div *ngIf="loadingDoctors" class="loading-overlay"><div class="spinner"></div></div>

      <form class="appointment-form" (ngSubmit)="submit()" *ngIf="!loadingDoctors">
        <div class="form-row">
          <div class="form-group">
            <label>Médico</label>
            <select [(ngModel)]="doctorId" name="doctorId" (ngModelChange)="loadSlots()" required>
              <option [ngValue]="null">Selecciona un médico</option>
              <option *ngFor="let doctor of doctors" [ngValue]="doctor.id">
                {{ doctor.nombre }} {{ doctor.especialidad ? '- ' + doctor.especialidad : '' }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Fecha</label>
            <input type="date" [(ngModel)]="date" name="date" [min]="minDate" (change)="loadSlots()" required>
          </div>
        </div>

        <div class="form-group">
          <label>Horario disponible</label>
          <div *ngIf="isToday(date)" class="alert alert-info">
            Hoy solo se muestran horarios posteriores a la hora actual. Si necesitas ver toda la agenda, selecciona una fecha futura.
          </div>
          <div *ngIf="loadingSlots" class="alert alert-info">Buscando horarios disponibles...</div>
          <select [(ngModel)]="slot" name="slot" required [disabled]="loadingSlots || slots.length === 0">
            <option value="">Selecciona un horario</option>
            <option *ngFor="let item of slots" [value]="item.fechaHoraInicio">{{ item.label }}</option>
          </select>
          <small *ngIf="!loadingSlots && doctorId && date && slots.length === 0">
            No hay horarios libres para esa fecha. Puede que el médico no tenga disponibilidad, que la agenda esté llena o que los horarios restantes de hoy ya hayan pasado.
          </small>
        </div>

        <div class="form-group">
          <label>Motivo de la cita</label>
          <textarea [(ngModel)]="motivo" name="motivo" rows="4" maxlength="255" required placeholder="Describe brevemente el motivo"></textarea>
        </div>

        <div class="actions">
          <button class="btn btn-primary" type="submit" [disabled]="saving || !doctorId || !slot || motivo.trim().length < 3">
            {{ saving ? 'Agendando...' : 'Agendar cita' }}
          </button>
        </div>
      </form>

      <div *ngIf="!loadingDoctors && doctors.length === 0" class="empty-state">
        <div class="icon">📅</div>
        <h3>No tienes médicos vinculados</h3>
        <p>Solicita primero un vínculo desde Buscar Médicos.</p>
        <a class="btn btn-primary" routerLink="/paciente/medicos">Buscar médicos</a>
      </div>
    </div>
  `,
  styles: [`
    .appointment-form { display: flex; flex-direction: column; gap: 18px; }
    .form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-weight: 700; color: #0f172a; }
    input, select, textarea {
      width: 100%;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 12px 14px;
      font: inherit;
      color: #0F172A;
      background: #fff;
    }
    textarea { resize: vertical; min-height: 100px; }
    small { color: #64748B; }
    .actions { display: flex; justify-content: flex-end; }
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
      .actions .btn { width: 100%; }
    }
  `]
})
export class AgendarCitaComponent implements OnInit {
  doctors: any[] = [];
  slots: any[] = [];
  doctorId: number | null = null;
  date = '';
  slot = '';
  motivo = '';
  minDate = this.today();
  loadingDoctors = true;
  loadingSlots = false;
  saving = false;
  error = '';
  success = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.date = this.minDate;
    this.api.getMyLinkedDoctors().pipe(
      finalize(() => {
        this.loadingDoctors = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar tus médicos vinculados.';
        this.cdr.detectChanges();
      },
    });
  }

  loadSlots() {
    this.slot = '';
    this.slots = [];
    this.error = '';
    if (!this.doctorId || !this.date) return;

    this.loadingSlots = true;
    this.api.getDoctorSlots(this.doctorId, this.date).pipe(
      finalize(() => {
        this.loadingSlots = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (slots) => {
        this.slots = slots;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudieron consultar los horarios.';
        this.cdr.detectChanges();
      },
    });
  }

  submit() {
    if (!this.doctorId || !this.slot || this.motivo.trim().length < 3) return;
    this.saving = true;
    this.error = '';
    this.success = '';

    this.api.createAppointment({
      doctorId: this.doctorId,
      fechaHoraInicio: this.slot,
      motivo: this.motivo.trim(),
    }).pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.success = 'Cita agendada correctamente. Quedará pendiente hasta que el médico la confirme.';
        this.motivo = '';
        this.cdr.detectChanges();
        window.setTimeout(() => {
          this.router.navigate(['/paciente/citas']);
        }, 700);
      },
      error: (err) => {
        this.error = err?.error?.message || 'No se pudo agendar la cita.';
        this.cdr.detectChanges();
      },
    });
  }

  private today() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  isToday(value: string) {
    return value === this.today();
  }
}
