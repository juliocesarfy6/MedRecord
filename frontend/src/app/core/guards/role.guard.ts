import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLoggedIn) {
      return router.createUrlTree(['/auth/login']);
    }
    const userRole = auth.currentUser?.role;
    if (userRole && allowedRoles.includes(userRole)) return true;

    if (userRole === 'paciente') return router.createUrlTree(['/paciente/dashboard']);
    if (userRole === 'medico') return router.createUrlTree(['/medico/dashboard']);
    if (userRole === 'admin') return router.createUrlTree(['/admin/dashboard']);
    return router.createUrlTree(['/auth/login']);
  };
};
