import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: 'admin/login',
    loadComponent: () => import('./admin/admin-login/admin-login').then(m => m.AdminLogin),
  },
  {
    path: 'admin/forgot-password',
    loadComponent: () => import('./admin/admin-forgot-password/admin-forgot-password').then(m => m.AdminForgotPassword),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule),
  },
  {
    path: '',
    loadChildren: () => import('./user/user-module').then(m => m.UserModule),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register').then(m => m.Register),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.Login),
  },
  {
    path: 'otp',
    loadComponent: () => import('./otp/otp').then(m => m.Otp),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPassword),
  },
];
