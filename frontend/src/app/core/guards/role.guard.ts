import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLoggedIn) {
      router.navigate(['/auth/login']);
      return false;
    }
    const userRole = auth.currentUser?.role;
    if (userRole && allowedRoles.includes(userRole)) return true;
    auth.redirectByRole();
    return false;
  };
};
