import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'paciente',
    canActivate: [authGuard, roleGuard(['paciente'])],
    loadChildren: () => import('./paciente/paciente.routes').then(m => m.pacienteRoutes),
  },
  {
    path: 'medico',
    canActivate: [authGuard, roleGuard(['medico'])],
    loadChildren: () => import('./medico/medico.routes').then(m => m.medicoRoutes),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
