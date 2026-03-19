import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../layouts/dashboard-layout/dashboard-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./usuarios/usuarios.component').then(m => m.UsuariosComponent),
      },
      {
        path: 'pacientes',
        loadComponent: () => import('./pacientes/pacientes.component').then(m => m.PacientesComponent),
      },
      {
        path: 'auditoria',
        loadComponent: () => import('./auditoria/auditoria.component').then(m => m.AuditoriaComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  }
];
