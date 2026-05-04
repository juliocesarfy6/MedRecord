import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header" style="margin-bottom: 24px;">
      <h1>Mi Historial Médico</h1>
      <p>Consulta los registros clínicos añadidos por tus médicos a tu expediente magnético.</p>
    </div>

    <!-- 🪄 Magia pura: El AsyncPipe controla todo sin bucles -->
    <ng-container *ngIf="historial$ | async as estado">

      <div *ngIf="estado.loading" class="alert alert-info" style="padding: 12px; background: #e0f2fe; color: #0284c7; border-radius: 8px;">
        ⏳ Cargando tu expediente clínico...
      </div>

      <div *ngIf="estado.error" class="alert alert-error" style="padding: 12px; background: #fef2f2; color: #991b1b; border-radius: 8px;">
        ❌ No se pudo cargar tu expediente. Intenta de nuevo.
      </div>

      <div *ngIf="estado.vacio" class="alert alert-warning" style="padding: 16px; background: #fef9c3; color: #854d0e; border-radius: 8px; text-align: center;">
        <strong>Aún no tienes registros médicos.</strong><br>
        Tus consultas aparecerán aquí una vez que un médico autorizado las registre.
      </div>

      <!-- Lista de Consultas (Tarjetas) -->
      <div class="records-grid" *ngIf="estado.datos" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="card" *ngFor="let record of estado.datos" style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f3f4f6; padding-bottom: 16px; margin-bottom: 16px;">
            <h3 style="margin: 0; color: #1e3a8a; font-size: 1.25rem;">{{ record.motivoConsulta || record.motivo || 'Consulta General' }}</h3>
            <span style="background: #eff6ff; color: #2563eb; padding: 6px 12px; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">
              📅 {{ record.fecha | date:'longDate' }}
            </span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
              <strong style="color: #475569;">👨‍⚕️ Atendido por:</strong> 
              <span style="color: #0f172a; margin-left: 8px;">{{ record.doctor?.user?.nombre || 'Médico' }}</span>
            </div>

            <div *ngIf="record.diagnostico">
              <strong style="color: #475569; display: block; margin-bottom: 4px;">📋 Diagnóstico Clínico:</strong> 
              <p style="margin: 0; color: #334155; line-height: 1.5;">{{ record.diagnostico }}</p>
            </div>

            <div *ngIf="record.tratamiento">
              <strong style="color: #475569; display: block; margin-bottom: 4px;">💊 Tratamiento e Indicaciones:</strong> 
              <p style="margin: 0; color: #334155; line-height: 1.5; white-space: pre-wrap;">{{ record.tratamiento }}</p>
            </div>
          </div>

        </div>
      </div>

    </ng-container>
  `
})
export class HistorialComponent {
  // Observamos el flujo de datos directamente, sin variables intermedias
  historial$: Observable<any>;

  constructor(private api: ApiService) {
    this.historial$ = this.api.getMyMedicalRecords().pipe(
      map(res => {
        if (!res || res.length === 0) return { vacio: true };
        const ordenados = [...res].sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        return { datos: ordenados };
      }),
      catchError(err => {
        console.error(err);
        return of({ error: true });
      }),
      startWith({ loading: true })
    );
  }
}