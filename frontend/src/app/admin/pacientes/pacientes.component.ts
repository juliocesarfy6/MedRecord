import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Directorio de Pacientes</h1>
      <p>Listado global de pacientes registrados en el sistema MedRecord.</p>
    </div>

    <div class="card">
      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>
      <div class="alert alert-error" *ngIf="error">{{ error }}</div>

      <div class="table-container" *ngIf="!loading && patients.length > 0">
        <table>
          <thead>
            <tr>
              <th>ID Sistema</th>
              <th>Nombre Completo</th>
              <th>CURP / Identidad</th>
              <th>Email Contacto</th>
              <th>Nacimiento</th>
              <th>Estado Cuenta</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of patients">
              <td><span style="font-family: monospace; font-size: 11px; color: var(--gray-400);">#{{ p.id }}</span></td>
              <td><strong>{{ p.user?.nombre || 'N/D' }}</strong></td>
              <td>{{ p.curp || 'No especificado' }}</td>
              <td>{{ p.user?.email || 'N/D' }}</td>
              <td>{{ p.fechaNacimiento ? (p.fechaNacimiento | date:'dd/MM/yyyy') : 'N/D' }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-success': p.user?.status === 'activo',
                  'badge-danger': p.user?.status === 'inactivo'
                }">{{ p.user?.status || 'desconocido' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && patients.length === 0" class="empty-state">
        <div class="icon">🧑‍⚕️</div>
        <h3>No hay pacientes registrados</h3>
      </div>
    </div>
  `
})
export class PacientesComponent implements OnInit {
  patients: any[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const loadingGuard = window.setTimeout(() => {
      if (!this.loading) return;
      this.error = 'La carga está tardando demasiado. Recarga la vista o revisa el backend.';
      this.loading = false;
      this.cdr.detectChanges();
    }, 7000);

    this.api.getAllPatients().pipe(
      finalize(() => {
        window.clearTimeout(loadingGuard);
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => { this.patients = res; },
      error: () => {
        this.error = 'No se pudieron cargar los pacientes. Revisa que el backend esté activo.';
      }
    });
  }
}
