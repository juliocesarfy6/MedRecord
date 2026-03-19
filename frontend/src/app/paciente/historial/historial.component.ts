import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>Mi Historial Médico</h1>
      <p>Consulta el registro de todas tus visitas y tratamientos.</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Consultas Anteriores</h2>
      </div>

      <div class="alert alert-error" *ngIf="error">{{ error }}</div>

      <div *ngIf="loading" class="loading-overlay"><div class="spinner"></div></div>

      <div class="table-container" *ngIf="!loading && records.length > 0">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Médico Tratante</th>
              <th>Motivo de Consulta</th>
              <th>Diagnóstico</th>
              <th>Tratamiento</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let rec of records">
              <td><strong>{{ rec.fecha | date:'dd/MM/yyyy' }}</strong></td>
              <td>{{ rec.doctor?.nombre || 'N/A' }}</td>
              <td>{{ rec.motivo }}</td>
              <td>{{ rec.diagnostico || 'No especificado' }}</td>
              <td>{{ rec.tratamiento || 'No especificado' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && records.length === 0" class="empty-state">
        <div class="icon">📁</div>
        <h3>No hay registros médicos</h3>
        <p>Aún no tienes consultas registradas en tu expediente electrónico.</p>
      </div>
    </div>
  `
})
export class HistorialComponent implements OnInit {
  records: any[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getMyMedicalRecords().subscribe({
      next: (res) => { this.records = res; this.loading = false; },
      error: () => { this.error = 'Error al cargar el historial médico'; this.loading = false; }
    });
  }
}
