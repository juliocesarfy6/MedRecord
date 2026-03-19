import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../layouts/dashboard-layout/dashboard-layout.component';

export const medicoRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'validar-token',
        loadComponent: () => import('./validar-token/validar-token.component').then(m => m.ValidarTokenComponent),
      },
      {
        path: 'expediente/:id',
        loadComponent: () => import('./ver-expediente/ver-expediente.component').then(m => m.VerExpedienteComponent),
      },
      {
        path: 'registrar-consulta',
        loadComponent: () => import('./registrar-consulta/registrar-consulta.component').then(m => m.RegistrarConsultaComponent),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./perfil/perfil.component').then(m => m.PerfilComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  }
];
