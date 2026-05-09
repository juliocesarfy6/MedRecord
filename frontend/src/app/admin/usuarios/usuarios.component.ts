import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Gestión de Usuarios</h1>
      <p>Administra los accesos y aprueba o rechaza cuentas médicas.</p>
    </div>

    <div class="card">
      <div class="card-header users-header">
        <div>
          <h2 class="card-title">Usuarios del sistema</h2>
          <p class="muted" *ngIf="pendingDoctorsCount > 0">
            Tienes {{ pendingDoctorsCount }} médico(s) pendiente(s) de aprobación.
          </p>
          <p class="muted" *ngIf="pendingDoctorsCount === 0">
            No hay médicos pendientes por aprobar.
          </p>
        </div>
        <div class="filters">
          <button type="button" class="btn btn-sm" [class.btn-primary]="filter === 'pendientes'" (click)="setFilter('pendientes')">
            Pendientes
          </button>
          <button type="button" class="btn btn-sm" [class.btn-primary]="filter === 'todos'" (click)="setFilter('todos')">
            Todos
          </button>
          <button type="button" class="btn btn-sm" [class.btn-primary]="filter === 'medicos'" (click)="setFilter('medicos')">
            Médicos
          </button>
          <button type="button" class="btn btn-sm" [class.btn-primary]="filter === 'pacientes'" (click)="setFilter('pacientes')">
            Pacientes
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>
      <div class="alert alert-error" *ngIf="error">{{ error }}</div>
      <div class="alert alert-success" *ngIf="success">{{ success }}</div>

      <div class="table-container" *ngIf="!loading && visibleUsers.length > 0">
        <table>
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Rol / Tipo</th>
              <th>Datos de validación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of visibleUsers" [class.pending-row]="u.role === 'medico' && u.status === 'pendiente'">
              <td><strong>{{ u.nombre }}</strong></td>
              <td>{{ u.email }}</td>
              <td>
                <!-- Role Badge -->
                <span class="badge" [ngClass]="{
                  'badge-success': u.role === 'paciente',
                  'badge-info': u.role === 'medico',
                  'badge-warning': u.role === 'admin'
                }">{{ u.role }}</span>
              </td>
              <td>
                <div *ngIf="u.role === 'medico'; else patientData" class="validation-data">
                  <strong>{{ u.doctor?.especialidad || 'Especialidad no capturada' }}</strong>
                  <span>Cédula: {{ u.doctor?.cedulaProfesional || 'N/D' }}</span>
                </div>
                <ng-template #patientData>
                  <span>{{ u.patient?.curp || '-' }}</span>
                </ng-template>
              </td>
              <td>
                <!-- Status Badge -->
                <span class="badge" [ngClass]="{
                  'badge-success': u.status === 'activo',
                  'badge-warning': u.status === 'pendiente',
                  'badge-danger': u.status === 'inactivo'
                }">{{ u.status }}</span>
              </td>
              <td>
                <div class="actions">
                  
                  <!-- Activate / Suspend Actions -->
                  <button *ngIf="u.status !== 'pendiente' && u.role !== 'admin'" 
                          class="btn btn-sm" 
                          [class.btn-danger]="u.status === 'activo'" 
                          [class.btn-success]="u.status === 'inactivo'"
                          (click)="toggleStatus(u.id)">
                    {{ u.status === 'activo' ? 'Suspender' : 'Activar' }}
                  </button>

                  <!-- Doctor Approval Actions -->
                  <ng-container *ngIf="u.role === 'medico' && u.status === 'pendiente'">
                    <button class="btn btn-sm btn-success" (click)="aprobarMedico(u.id)">Aprobar</button>
                    <button class="btn btn-sm btn-danger" (click)="rechazarMedico(u.id)">Rechazar</button>
                  </ng-container>

                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && !error && visibleUsers.length === 0" class="empty-state">
        <div class="icon">👥</div>
        <h3>No hay usuarios para este filtro</h3>
        <p>Prueba con otro filtro o registra una nueva cuenta.</p>
      </div>
    </div>
  `,
  styles: [`
    .users-header {
      align-items: flex-start;
      gap: 16px;
    }
    .muted {
      color: #64748B;
      font-size: 13px;
      margin-top: 4px;
    }
    .filters,
    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .pending-row {
      background: rgba(245, 158, 11, 0.08);
    }
    .validation-data {
      display: flex;
      flex-direction: column;
      gap: 2px;
      color: #0F172A;
    }
    .validation-data span {
      color: #64748B;
      font-size: 12px;
    }
    @media (max-width: 768px) {
      .filters .btn {
        flex: 1 1 45%;
      }
    }
  `]
})
export class UsuariosComponent implements OnInit {
  users: any[] = [];
  loading = true;
  error = '';
  success = '';
  filter: 'pendientes' | 'todos' | 'medicos' | 'pacientes' = 'pendientes';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = '';
    this.success = '';
    const loadingGuard = window.setTimeout(() => {
      if (!this.loading) return;
      this.error = 'La carga está tardando demasiado. Recarga la vista o revisa el backend.';
      this.loading = false;
      this.cdr.detectChanges();
    }, 7000);

    this.api.getAllUsers().pipe(
      finalize(() => {
        window.clearTimeout(loadingGuard);
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.users = res;
        if (this.pendingDoctorsCount === 0 && this.filter === 'pendientes') {
          this.filter = 'todos';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios. Revisa que el backend esté activo.';
        this.cdr.detectChanges();
      }
    });
  }

  get pendingDoctorsCount() {
    return this.users.filter((u) => u.role === 'medico' && u.status === 'pendiente').length;
  }

  get visibleUsers() {
    const sorted = [...this.users].sort((a, b) => {
      const aPending = a.role === 'medico' && a.status === 'pendiente' ? 0 : 1;
      const bPending = b.role === 'medico' && b.status === 'pendiente' ? 0 : 1;
      return aPending - bPending || b.id - a.id;
    });

    if (this.filter === 'pendientes') return sorted.filter((u) => u.role === 'medico' && u.status === 'pendiente');
    if (this.filter === 'medicos') return sorted.filter((u) => u.role === 'medico');
    if (this.filter === 'pacientes') return sorted.filter((u) => u.role === 'paciente');
    return sorted;
  }

  setFilter(filter: 'pendientes' | 'todos' | 'medicos' | 'pacientes') {
    this.filter = filter;
  }

  toggleStatus(id: string) {
    if(!confirm('¿Cambiar estado del usuario?')) return;
    this.api.toggleUserStatus(id).subscribe({
      next: () => {
        this.success = 'Estado actualizado correctamente.';
        this.load();
      },
      error: () => {
        this.error = 'No se pudo cambiar el estado del usuario.';
        this.cdr.detectChanges();
      }
    });
  }

  aprobarMedico(id: string) {
    if(!confirm('¿Aprobar profesional médico? Obtendrá acceso completo de doctor.')) return;
    this.api.approveDoctor(id).subscribe({
      next: () => {
        this.success = 'Médico aprobado correctamente.';
        this.load();
      },
      error: () => {
        this.error = 'No se pudo aprobar el médico.';
        this.cdr.detectChanges();
      }
    });
  }

  rechazarMedico(id: string) {
    if(!confirm('¿Rechazar profesional médico?')) return;
    this.api.rejectDoctor(id).subscribe({
      next: () => {
        this.success = 'Médico rechazado correctamente.';
        this.load();
      },
      error: () => {
        this.error = 'No se pudo rechazar el médico.';
        this.cdr.detectChanges();
      }
    });
  }
}
