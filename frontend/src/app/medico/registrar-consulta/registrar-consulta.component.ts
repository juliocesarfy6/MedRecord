import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-registrar-consulta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1>Registrar Nueva Consulta</h1>
      <p>Añade una nueva entrada clínica al expediente del paciente.</p>
    </div>

    <div class="card" style="max-width: 800px;">
      
      <div class="alert alert-warning" style="margin-bottom: 24px;">
        <strong>Nota:</strong> Solo aparecen pacientes vinculados contigo. El token sigue siendo necesario para consultar su historial previo.
        <button type="button" class="btn btn-outline btn-sm refresh-btn" (click)="loadAuthorizedPatients()" [disabled]="loadingPatients">
          {{ loadingPatients ? 'Actualizando...' : 'Actualizar lista' }}
        </button>
      </div>

      <div *ngIf="success" class="alert alert-success">{{ success }}</div>
      <div *ngIf="error" class="alert alert-error">{{ error }}</div>
      <div *ngIf="loadingPatients" class="alert alert-info">Cargando pacientes vinculados...</div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="form-label">Paciente</label>
          <select formControlName="patientId" class="form-control" [class.error]="form.get('patientId')?.invalid && form.get('patientId')?.touched">
            <option value="">Selecciona un paciente vinculado</option>
            <option *ngFor="let p of patients" [value]="p.id">{{ p.user?.nombre }} ({{ p.curp || 'Sin CURP' }})</option>
          </select>
          <span class="form-error" *ngIf="form.get('patientId')?.invalid && form.get('patientId')?.touched">Requerido</span>
          <small *ngIf="!loadingPatients && patients.length === 0" class="hint">
            No hay pacientes vinculados todavía. Acepta una solicitud de paciente y pulsa "Actualizar lista".
          </small>
        </div>

        <div class="form-group">
          <label class="form-label">Fecha de la Consulta</label>
          <input formControlName="fecha" type="date" class="form-control" [attr.max]="today" [class.error]="form.get('fecha')?.invalid && form.get('fecha')?.touched">
          <span class="form-error" *ngIf="form.get('fecha')?.invalid && form.get('fecha')?.touched">Requerido</span>
        </div>

        <div class="form-group">
          <label class="form-label">Motivo Principal</label>
          <input formControlName="motivo" type="text" class="form-control" maxlength="255" placeholder="Ej: Dolor abdominal recurrente" [class.error]="form.get('motivo')?.invalid && form.get('motivo')?.touched">
          <span class="form-error" *ngIf="form.get('motivo')?.invalid && form.get('motivo')?.touched">Requerido</span>
        </div>

        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label">Diagnóstico Clínico</label>
          <textarea formControlName="diagnostico" class="form-control" rows="3" maxlength="2000" placeholder="Descripción detallada del diagnóstico..." [class.error]="form.get('diagnostico')?.invalid && form.get('diagnostico')?.touched"></textarea>
          <span class="form-error" *ngIf="form.get('diagnostico')?.invalid && form.get('diagnostico')?.touched">Requerido</span>
        </div>

        <div class="form-group">
          <label class="form-label">Tratamiento e Indicaciones</label>
          <textarea formControlName="tratamiento" class="form-control" rows="3" maxlength="2000" placeholder="Medidas y pasos de tratamiento..." [class.error]="form.get('tratamiento')?.invalid && form.get('tratamiento')?.touched"></textarea>
          <span class="form-error" *ngIf="form.get('tratamiento')?.invalid && form.get('tratamiento')?.touched">Requerido</span>
        </div>

        <div class="form-group">
          <label class="form-label">Medicamentos (Receta)</label>
          <textarea formControlName="medicamentos" class="form-control" rows="2" maxlength="1000" placeholder="Listado de medicamentos y dosis..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Observaciones Privadas / Notas</label>
          <textarea formControlName="observaciones" class="form-control" rows="2" maxlength="2000" placeholder="Cualquier otra observación médica general..."></textarea>
        </div>

        <div style="margin-top: 24px; text-align: right;">
          <button type="submit" class="btn btn-primary btn-lg" [disabled]="form.invalid || loading">
            <span *ngIf="loading" class="spinner-sm"></span>
            {{ loading ? 'Guardando Registro...' : 'Guardar Consulta en Expediente' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .refresh-btn {
      float: right;
      margin-top: -4px;
    }
    .hint {
      display: block;
      color: #64748B;
      margin-top: 6px;
    }
    @media (max-width: 768px) {
      .refresh-btn {
        float: none;
        display: block;
        margin-top: 12px;
      }
    }
  `]
})
export class RegistrarConsultaComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = false;
  loadingPatients = false;
  success = '';
  error = '';
  patients: any[] = [];
  today = new Date().toISOString().split('T')[0];
  private subscriptions = new Subscription();

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      fecha: [this.today, Validators.required],
      motivo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      diagnostico: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(2000)]],
      tratamiento: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(2000)]],
      medicamentos: ['', Validators.maxLength(1000)],
      observaciones: ['', Validators.maxLength(2000)]
    });
  }

  ngOnInit() {
    this.loadAuthorizedPatients();

    this.subscriptions.add(
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe((event) => {
          if (event.urlAfterRedirects.startsWith('/medico/registrar-consulta')) {
            this.loadAuthorizedPatients();
          }
        })
    );

    window.addEventListener('focus', this.handleWindowFocus);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    window.removeEventListener('focus', this.handleWindowFocus);
  }

  loadAuthorizedPatients() {
    this.loadingPatients = true;
    this.error = '';

    this.api.getAuthorizedPatients().pipe(
      finalize(() => {
        this.loadingPatients = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.patients = res;
        const selected = Number(this.form.value.patientId);
        if (selected && !this.patients.some((patient) => patient.id === selected)) {
          this.form.patchValue({ patientId: '' });
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error cargando pacientes vinculados. Revisa tus solicitudes aceptadas e intenta de nuevo.';
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.success = '';
    this.error = '';

    // --- TRADUCCIÓN DE DATOS PARA EL BACKEND ---
    const dataParaBackend = {
      ...this.form.value,
      // 1. Forzamos que el ID sea número (el <select> lo manda como string)
      patientId: Number(this.form.value.patientId),

      // 2. Renombramos 'motivo' a 'motivoConsulta' (lo que pide NestJS)
      motivoConsulta: this.form.value.motivo,

      // 3. Opcional: Si el backend no tiene el campo 'medicamentos', 
      // puedes concatenarlo al tratamiento o dejarlo si el DTO lo ignora.
      tratamiento: `${this.form.value.tratamiento}\n\nMedicamentos: ${this.form.value.medicamentos}`
    };

    // Eliminamos el campo 'motivo' original para que no ensucie la petición
    delete dataParaBackend.motivo;
    delete dataParaBackend.medicamentos;
    // -------------------------------------------

    this.api.createMedicalRecord(dataParaBackend).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Consulta registrada correctamente en el expediente magnético del paciente.';
        this.form.reset({
          fecha: this.today,
          patientId: '' // Limpiamos también el select
        });
        this.cdr.detectChanges();
        setTimeout(() => {
          this.success = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        this.loading = false;
        // Esto te mostrará el mensaje exacto si algo más falla
        this.error = err?.error?.message || 'Ocurrió un error al registrar la consulta.';
        this.cdr.detectChanges();
      }
    });
  }

  private handleWindowFocus = () => {
    this.loadAuthorizedPatients();
  };
}
