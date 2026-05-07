import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1>Mi Perfil y Actividad</h1>
          <p>Registro de seguridad y auditoría de tu cuenta médica.</p>
        </div>
        <span class="badge badge-info" style="font-size: 14px; padding: 8px 16px; background-color: #e0f2fe; color: #0369a1; border-radius: 9999px;">Médico Validado</span>
      </div>
    </div>

    <div class="card" style="margin-top: 24px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
      <div class="card-header" style="margin-bottom: 16px;">
        <h2 class="card-title" style="margin: 0; font-size: 1.25rem;">Mis Últimas Acciones en el Sistema</h2>
      </div>

      <div class="table-container" *ngIf="logs.length > 0; else noLogs">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead style="background-color: #f9fafb;">
            <tr>
              <th style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Fecha y Hora</th>
              <th style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Acción Realizada</th>
              <th style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Detalles de la Operación</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of logs">
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">
                {{ log.fechaHora | date:'dd/MM/yyyy HH:mm' }}
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <span [ngStyle]="{'background-color': log.accion.includes('LOGIN') ? '#dcfce7' : '#fef3c7', 'color': log.accion.includes('LOGIN') ? '#166534' : '#92400e', 'padding': '4px 8px', 'border-radius': '4px', 'font-size': '12px', 'font-weight': 'bold'}">
                  {{ log.accion }}
                </span>
              </td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">
                {{ log.detalles }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #noLogs>
        <div style="text-align: center; padding: 40px; color: #6b7280;">
          <div style="font-size: 40px; margin-bottom: 16px;">🛡️</div>
          <h3 style="margin: 0 0 8px 0; color: #111827;">Sin actividad reciente</h3>
          <p style="margin: 0;">Aún no hay registros de auditoría vinculados a tu cuenta.</p>
        </div>
      </ng-template>
    </div>
  `
})
export class PerfilComponent implements OnInit {
  logs: any[] = [];

  constructor(private api: ApiService) { }

  ngOnInit() {
    // Aquí mandamos a llamar a tu backend de NestJS
    this.api.getMyAuditLogs().subscribe({
      next: (data) => {
        this.logs = data;
      },
      error: (err) => {
        console.error('Error al cargar la auditoría', err);
      }
    });
  }
}