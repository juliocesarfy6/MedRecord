import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AppIconComponent } from '../../shared/app-icon.component';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  template: `
    <div class="page-header">
      <h1>Notificaciones</h1>
      <p>Revisa nuevas citas y accesos autorizados por token.</p>
    </div>

    <div class="card">
      <div class="card-header notifications-header">
        <div>
          <h2 class="card-title">Bandeja del médico</h2>
          <p class="muted">{{ unreadCount }} pendiente(s) por leer</p>
        </div>
        <div class="actions">
          <button class="btn btn-secondary btn-sm" type="button" (click)="load()" [disabled]="loading">Actualizar</button>
          <button class="btn btn-primary btn-sm" type="button" (click)="markAllAsRead()" [disabled]="loading || unreadCount === 0">
            Marcar todas como leídas
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>
      <div class="alert alert-error" *ngIf="error">{{ error }}</div>

      <div class="notification-list" *ngIf="!loading && notifications.length > 0">
        <article
          class="notification-item"
          *ngFor="let notification of notifications"
          [class.unread]="!notification.readAt"
        >
          <div class="notification-icon"><app-icon [name]="iconFor(notification.type)"></app-icon></div>
          <div class="notification-body">
            <div class="notification-top">
              <h3>{{ notification.title }}</h3>
              <span>{{ notification.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <p>{{ notification.message }}</p>
            <div class="token-preview" *ngIf="notification.metadata?.token">
              <span>Token</span>
              <strong>{{ notification.metadata.token }}</strong>
            </div>
            <div class="notification-actions">
              <button
                class="btn btn-primary btn-sm"
                type="button"
                *ngIf="notification.link"
                (click)="openNotification(notification)">
                Abrir
              </button>
              <button
                class="btn btn-secondary btn-sm"
                type="button"
                *ngIf="!notification.readAt"
                (click)="markAsRead(notification)">
                Marcar leída
              </button>
            </div>
          </div>
        </article>
      </div>

      <div *ngIf="!loading && !error && notifications.length === 0" class="empty-state">
        <div class="icon"><app-icon name="bell"></app-icon></div>
        <h3>Sin notificaciones</h3>
        <p>Cuando un paciente agende una cita o valide un token contigo, aparecerá aquí.</p>
      </div>
    </div>
  `,
  styles: [`
    .notifications-header,
    .actions,
    .notification-actions,
    .notification-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .muted {
      color: #64748B;
      font-size: 13px;
      margin-top: 4px;
    }
    .actions,
    .notification-actions {
      flex-wrap: wrap;
    }
    .notification-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .notification-item {
      display: grid;
      grid-template-columns: 44px 1fr;
      gap: 14px;
      padding: 16px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      background: #FFFFFF;
    }
    .notification-item.unread {
      border-color: #93C5FD;
      background: #EFF6FF;
    }
    .notification-icon {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      background: #DBEAFE;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      color: #2563EB;
    }
    .notification-body h3 {
      font-size: 16px;
      color: #0F172A;
      margin: 0;
    }
    .notification-top span {
      color: #64748B;
      font-size: 12px;
      white-space: nowrap;
    }
    .notification-body p {
      color: #475569;
      margin: 6px 0 12px;
      line-height: 1.5;
    }
    .token-preview {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border: 1px dashed #2563EB;
      border-radius: 8px;
      background: #F8FAFC;
      margin-bottom: 12px;
    }
    .token-preview span {
      color: #64748B;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .token-preview strong {
      color: #1E3A8A;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.05em;
    }
    @media (max-width: 640px) {
      .notifications-header,
      .notification-top {
        align-items: flex-start;
        flex-direction: column;
      }
      .notification-item {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class NotificacionesComponent implements OnInit {
  notifications: any[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  get unreadCount() {
    return this.notifications.filter((notification) => !notification.readAt).length;
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.getMyNotifications().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        window.dispatchEvent(new Event('medrecord:notifications-updated'));
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar las notificaciones.';
        this.cdr.detectChanges();
      },
    });
  }

  iconFor(type: string) {
    if (type === 'appointment_created') return 'calendar';
    if (type === 'token_access_granted') return 'unlock';
    if (type === 'patient_link_request') return 'handshake';
    return 'bell';
  }

  openNotification(notification: any) {
    const navigate = () => {
      if (!notification.link) return;
      if (notification.link === '/medico/validar-token' && notification.metadata?.token) {
        this.router.navigate(['/medico/validar-token'], { queryParams: { token: notification.metadata.token } });
        return;
      }
      this.router.navigateByUrl(notification.link);
    };
    if (notification.readAt) {
      navigate();
      return;
    }
    this.api.markNotificationAsRead(notification.id).subscribe({
      next: () => {
        notification.readAt = new Date().toISOString();
        window.dispatchEvent(new Event('medrecord:notifications-updated'));
        this.cdr.detectChanges();
        navigate();
      },
      error: () => navigate(),
    });
  }

  markAsRead(notification: any) {
    this.api.markNotificationAsRead(notification.id).subscribe({
      next: () => {
        notification.readAt = new Date().toISOString();
        window.dispatchEvent(new Event('medrecord:notifications-updated'));
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo marcar la notificación como leída.';
        this.cdr.detectChanges();
      },
    });
  }

  markAllAsRead() {
    this.api.markAllNotificationsAsRead().subscribe({
      next: () => {
        const now = new Date().toISOString();
        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          readAt: notification.readAt || now,
        }));
        window.dispatchEvent(new Event('medrecord:notifications-updated'));
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron marcar las notificaciones como leídas.';
        this.cdr.detectChanges();
      },
    });
  }
}
