import { Component } from '@angular/core';

@Component({
  selector: 'app-perfil-medico',
  standalone: true,
  template: `
    <div class="page-header">
      <h1>Perfil de Médico Titular</h1>
      <p>Vista de información como profesional de salud.</p>
    </div>

    <div class="card" style="max-width: 600px; text-align: center; padding: 60px 20px;">
      <div style="font-size: 64px; margin-bottom: 24px;">👨‍⚕️</div>
      <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">Portal de Profesionales</h2>
      <p style="color: var(--gray-500); line-height: 1.6;">
        Tu cuenta es mantenida y verificada por la administración del hospital. 
        Si deseas cambiar tu especialidad, credenciales o cédula profesional, por favor contacta al administrador del sistema.
      </p>
    </div>
  `
})
export class PerfilComponent {}
