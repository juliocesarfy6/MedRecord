import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

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
      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>

      <div class="table-container" *ngIf="!loading && users.length > 0">
        <table>
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Rol / Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
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
                <!-- Status Badge -->
                <span class="badge" [ngClass]="{
                  'badge-success': u.status === 'activo',
                  'badge-warning': u.status === 'pendiente',
                  'badge-danger': u.status === 'inactivo'
                }">{{ u.status }}</span>
              </td>
              <td>
                <div style="display:flex; gap: 8px;">
                  
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
                    <button class="btn btn-sm btn-success" (click)="aprobarMedico(u.id)">✅ Aprobar</button>
                    <button class="btn btn-sm btn-danger" (click)="rechazarMedico(u.id)">❌ Rechazar</button>
                  </ng-container>

                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class UsuariosComponent implements OnInit {
  users: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.getAllUsers().subscribe({
      next: (res) => { this.users = res; this.loading = false; },
      error: () => this.loading = false
    });
  }

  toggleStatus(id: string) {
    if(!confirm('¿Cambiar estado del usuario?')) return;
    this.api.toggleUserStatus(id).subscribe(() => this.load());
  }

  aprobarMedico(id: string) {
    if(!confirm('¿Aprobar profesional médico? Obtendrá acceso completo de doctor.')) return;
    this.api.approveDoctor(id).subscribe(() => this.load());
  }

  rechazarMedico(id: string) {
    if(!confirm('¿Rechazar profesional médico?')) return;
    this.api.rejectDoctor(id).subscribe(() => this.load());
  }
}
