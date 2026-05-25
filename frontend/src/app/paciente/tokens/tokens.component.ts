import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { finalize } from 'rxjs';

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
      <div class="alert alert-error" *ngIf="error">{{ error }}</div>
      <div class="alert alert-success" *ngIf="success">{{ success }}</div>

      <div class="table-container" *ngIf="!loading && tokens.length > 0">
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Médico</th>
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
              <td>{{ tk.doctor?.nombre || 'No asignado' }}</td>
              <td>{{ tk.descripcion || 'Sin descripción' }}</td>
              <td><span class="badge badge-primary">{{ tk.nivelAcceso }}</span></td>
              <td>{{ tk.createdAt | date:'dd/MM/yy HH:mm' }}</td>
              <td>{{ tk.fechaExpiracion | date:'dd/MM/yy HH:mm' }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-success': tk.estado === 'activo',
                  'badge-warning': tk.estado === 'expirado',
                  'badge-danger': tk.estado === 'revocado',
                  'badge-info': tk.estado === 'usado'
                }">
                  {{ getEstadoLabel(tk.estado) }}
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
  error = '';
  success = '';
  revokingId: number | null = null;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadTokens();
  }

  loadTokens() {
    this.loading = true;
    this.error = '';
    const loadingGuard = window.setTimeout(() => {
      if (!this.loading) return;
      this.error = 'La carga está tardando demasiado. Recarga la vista o revisa el backend.';
      this.loading = false;
      this.cdr.detectChanges();
    }, 7000);

    this.api.getMyTokens().pipe(
      finalize(() => {
        window.clearTimeout(loadingGuard);
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.tokens = res;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus tokens. Revisa que el backend esté activo.';
      }
    });
  }

  revocar(id: number) {
    if (!confirm('¿Estás seguro de que deseas revocar este token inmediatamente?')) return;
    this.revokingId = id;
    this.error = '';
    this.success = '';

    this.api.revokeToken(id).pipe(
      finalize(() => {
        this.revokingId = null;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.success = 'Token revocado correctamente.';
        this.loadTokens();
      },
      error: () => {
        this.error = 'No se pudo revocar el token.';
      }
    });
  }

  getEstadoLabel(estado: string) {
    const labels: Record<string, string> = {
      activo: 'Activo',
      usado: 'Usado',
      expirado: 'Expirado',
      revocado: 'Revocado',
    };
    return labels[estado] || estado;
  }
}
