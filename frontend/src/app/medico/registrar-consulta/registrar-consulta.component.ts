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

      <div class="print-panel" *ngIf="lastPrintableRecord && lastPrintablePatient">
        <div>
          <strong>Receta lista para imprimir</strong>
          <p>Se generó con los datos de la consulta recién registrada.</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" (click)="printLastPrescription()">Imprimir receta</button>
      </div>

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
    .print-panel {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 16px;
      margin-bottom: 20px;
      border: 1px solid rgba(37, 99, 235, 0.24);
      border-radius: 10px;
      background: rgba(37, 99, 235, 0.06);
    }
    .print-panel p {
      margin: 4px 0 0;
      color: #64748B;
      font-size: 13px;
    }
    @media (max-width: 768px) {
      .refresh-btn {
        float: none;
        display: block;
        margin-top: 12px;
      }
      .print-panel {
        align-items: stretch;
        flex-direction: column;
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
  lastPrintableRecord: any = null;
  lastPrintablePatient: any = null;
  currentDoctor: any = null;
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
    this.loadDoctorProfile();

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

  loadDoctorProfile() {
    this.api.getMyDoctorProfile().subscribe({
      next: (profile) => {
        this.currentDoctor = profile;
        this.cdr.detectChanges();
      },
      error: () => {
        this.currentDoctor = null;
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
    this.lastPrintableRecord = null;
    this.lastPrintablePatient = null;
    const selectedPatient = this.patients.find((patient) => patient.id === Number(this.form.value.patientId));

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
      next: (createdRecord: any) => {
        this.loading = false;
        this.success = 'Consulta registrada correctamente en el expediente magnético del paciente.';
        this.lastPrintablePatient = selectedPatient || null;
        this.lastPrintableRecord = {
          ...createdRecord,
          ...dataParaBackend,
          id: createdRecord?.id,
          fecha: dataParaBackend.fecha,
          motivo: dataParaBackend.motivoConsulta,
          doctor: createdRecord?.doctor || this.currentDoctor,
        };
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

  printLastPrescription() {
    if (!this.lastPrintableRecord || !this.lastPrintablePatient) return;

    const printableWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printableWindow) {
      this.error = 'No se pudo abrir la ventana de impresión. Permite ventanas emergentes para imprimir la receta.';
      this.cdr.detectChanges();
      return;
    }

    printableWindow.document.open();
    printableWindow.document.write(this.buildPrescriptionHtml(this.lastPrintableRecord, this.lastPrintablePatient));
    printableWindow.document.close();
    printableWindow.focus();
    printableWindow.setTimeout(() => {
      printableWindow.print();
    }, 250);
  }

  private buildPrescriptionHtml(record: any, patient: any) {
    const patientName = this.escapeHtml(patient.user?.nombre || 'Paciente');
    const doctorName = this.escapeHtml(record.doctor?.user?.nombre || record.doctor?.nombre || 'Médico tratante');
    const doctorSpecialty = this.escapeHtml(record.doctor?.especialidad || '');
    const doctorLicense = this.escapeHtml(record.doctor?.cedulaProfesional || '');
    const date = this.formatPrintableDate(record.fecha);

    return `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receta MedRecord</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; padding: 32px; }
          .document { max-width: 760px; margin: 0 auto; border: 1px solid #dbe3ef; padding: 28px; }
          .header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #1d4ed8; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 24px; font-weight: 800; color: #1e3a8a; }
          .subtitle { color: #64748b; margin-top: 4px; }
          .meta { text-align: right; color: #334155; font-size: 13px; line-height: 1.5; }
          .section { margin-top: 20px; }
          .section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
          .label { color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 700; }
          .value { font-size: 15px; margin-top: 3px; white-space: pre-wrap; }
          .block { min-height: 70px; line-height: 1.55; white-space: pre-wrap; }
          .footer { display: grid; grid-template-columns: 1fr 240px; gap: 24px; margin-top: 60px; align-items: end; }
          .signature { border-top: 1px solid #0f172a; text-align: center; padding-top: 8px; font-size: 13px; }
          .fine-print { color: #64748b; font-size: 11px; line-height: 1.4; }
          @media print {
            body { padding: 0; }
            .document { border: 0; padding: 18mm; max-width: none; }
          }
        </style>
      </head>
      <body>
        <main class="document">
          <header class="header">
            <div>
              <div class="brand">MedRecord</div>
              <div class="subtitle">Receta e indicaciones de consulta</div>
            </div>
            <div class="meta">
              <strong>Fecha:</strong> ${date}<br>
              <strong>Consulta:</strong> #${this.escapeHtml(String(record.id || ''))}
            </div>
          </header>

          <section class="section">
            <h2>Paciente</h2>
            <div class="grid">
              <div><div class="label">Nombre</div><div class="value">${patientName}</div></div>
              <div><div class="label">CURP</div><div class="value">${this.escapeHtml(patient.curp || 'No registrada')}</div></div>
              <div><div class="label">Fecha de nacimiento</div><div class="value">${this.formatPrintableDate(patient.fechaNacimiento)}</div></div>
              <div><div class="label">Alergias</div><div class="value">${this.escapeHtml(patient.alergias || 'Ninguna conocida')}</div></div>
            </div>
          </section>

          <section class="section">
            <h2>Médico</h2>
            <div class="grid">
              <div><div class="label">Nombre</div><div class="value">Dr. ${doctorName}</div></div>
              <div><div class="label">Especialidad</div><div class="value">${doctorSpecialty || 'No especificada'}</div></div>
              <div><div class="label">Cédula profesional</div><div class="value">${doctorLicense || 'No registrada'}</div></div>
            </div>
          </section>

          <section class="section">
            <h2>Motivo de consulta</h2>
            <div class="block">${this.escapeHtml(record.motivo || record.motivoConsulta || 'No especificado')}</div>
          </section>

          <section class="section">
            <h2>Diagnóstico</h2>
            <div class="block">${this.escapeHtml(record.diagnostico || 'No especificado')}</div>
          </section>

          <section class="section">
            <h2>Tratamiento, medicamentos e indicaciones</h2>
            <div class="block">${this.escapeHtml(record.tratamiento || 'No especificado')}</div>
          </section>

          <footer class="footer">
            <div class="fine-print">
              Documento generado desde MedRecord. Esta impresión corresponde a la consulta registrada en el expediente clínico.
            </div>
            <div class="signature">Firma del médico</div>
          </footer>
        </main>
      </body>
      </html>
    `;
  }

  private formatPrintableDate(value: string | Date) {
    if (!value) return 'No registrada';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No registrada';
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private escapeHtml(value: string) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
