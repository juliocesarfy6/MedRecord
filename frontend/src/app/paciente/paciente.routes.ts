import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../layouts/dashboard-layout/dashboard-layout.component';

export const pacienteRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'historial',
        loadComponent: () => import('./historial/historial.component').then(m => m.HistorialComponent),
      },
      {
        path: 'tokens',
        loadComponent: () => import('./tokens/tokens.component').then(m => m.TokensComponent),
      },
      {
        path: 'tokens/nuevo',
        loadComponent: () => import('./generar-token/generar-token.component').then(m => m.GenerarTokenComponent),
      },
      {
        path: 'auditoria',
        loadComponent: () => import('./auditoria/auditoria.component').then(m => m.AuditoriaComponent),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./perfil/perfil.component').then(m => m.PerfilComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  }
];
