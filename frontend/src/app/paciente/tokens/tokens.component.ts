import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-tokens',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Mis Tokens de Acceso</h1>
      <p>Administra quién tiene acceso a tu información médica.</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Tokens Generados</h2>
      </div>

      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>

      <div class="table-container" *ngIf="!loading && tokens.length > 0">
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Descripción</th>
              <th>Nivel</th>
              <th>Creación</th>
              <th>Expira</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tk of tokens">
              <td><strong style="font-family: monospace;">{{ tk.token }}</strong></td>
              <td>{{ tk.descripcion || 'Sin descripción' }}</td>
              <td><span class="badge badge-primary">{{ tk.nivelAcceso }}</span></td>
              <td>{{ tk.createdAt | date:'dd/MM/yy HH:mm' }}</td>
              <td>{{ tk.fechaExpiracion | date:'dd/MM/yy HH:mm' }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-success': tk.estado === 'activo',
                  'badge-warning': tk.estado === 'expirado',
                  'badge-danger': tk.estado === 'revocado'
                }">
                  {{ tk.estado }}
                </span>
              </td>
              <td>
                <button *ngIf="tk.estado === 'activo'" 
                        class="btn btn-danger btn-sm" 
                        (click)="revocar(tk.id)"
                        [disabled]="revokingId === tk.id">
                  {{ revokingId === tk.id ? '...' : 'Revocar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && tokens.length === 0" class="empty-state">
        <div class="icon">🔐</div>
        <h3>No tienes tokens generados</h3>
        <p>Genera un token cuando necesites compartir tu expediente con un médico.</p>
      </div>
    </div>
  `
})
export class TokensComponent implements OnInit {
  tokens: any[] = [];
  loading = true;
  revokingId: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadTokens();
  }

  loadTokens() {
    this.api.getMyTokens().subscribe({
      next: (res) => { this.tokens = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  revocar(id: string) {
    if (!confirm('¿Estás seguro de que deseas revocar este token inmediatamente?')) return;
    this.revokingId = id;
    this.api.revokeToken(id).subscribe({
      next: () => {
        this.revokingId = null;
        this.loadTokens(); // reload list
      },
      error: () => {
        alert('Error al revocar el token');
        this.revokingId = null;
      }
    });
  }
}
