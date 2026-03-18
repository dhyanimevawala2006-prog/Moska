import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (sessionStorage.getItem('adminId')) return true;
  router.navigate(['/admin/login']);
  return false;
};
