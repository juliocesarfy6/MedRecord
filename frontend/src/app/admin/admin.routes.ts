import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { AdminPacientesComponent } from './pacientes/pacientes.component';
import { AdminAuditoriaComponent } from './auditoria/auditoria.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'pacientes', component: AdminPacientesComponent },
  { path: 'auditoria', component: AdminAuditoriaComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];