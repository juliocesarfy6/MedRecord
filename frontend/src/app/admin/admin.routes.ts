import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { PacientesComponent } from './pacientes/pacientes.component';
import { AuditoriaComponent } from './auditoria/auditoria.component';

export const adminRoutes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'pacientes', component: PacientesComponent },
  { path: 'auditoria', component: AuditoriaComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
