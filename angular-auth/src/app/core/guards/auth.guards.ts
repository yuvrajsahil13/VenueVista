import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Role } from '../models/models';

/** Allows only logged-in users; otherwise redirects to /login and comes back afterwards. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;
  inject(ToastService).info('Please log in to continue');
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Allows only users whose role is listed in route data: { roles: [...] }. */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const roles = (route.data['roles'] ?? []) as Role[];
  const role = auth.user()?.role;
  if (role && roles.includes(role)) return true;
  inject(ToastService).error('You do not have access to that page');
  return inject(Router).createUrlTree(['/']);
};
