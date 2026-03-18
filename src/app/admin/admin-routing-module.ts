import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { adminAuthGuard } from './admin-auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [adminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'showuser',
        loadComponent: () => import('./pages/show-user/show-user').then(m => m.ShowUser),
      },
      {
        path: 'addproduct',
        loadComponent: () => import('./pages/add-product/add-product').then(m => m.AddProduct),
      },
      {
        path: 'showproduct',
        loadComponent: () => import('./pages/show-product/show-product').then(m => m.ShowProduct),
      },
      {
        path: 'editproduct/:id',
        loadComponent: () => import('./pages/edit-product/edit-product').then(m => m.EditProduct),
      },
      {
        path: 'category',
        loadComponent: () => import('./pages/category/category').then(m => m.Category),
      },
      {
        path: 'addcategory',
        loadComponent: () => import('./pages/addcategory/addcategory').then(m => m.Addcategory),
      },
      {
        path: 'editcategory/:id',
        loadComponent: () => import('./pages/editcategory/editcategory').then(m => m.EditCategory),
      },
      {
        path: 'addcupon',
        loadComponent: () => import('./add-coupon/add-coupon').then(m => m.AddCouponComponent),
      },
      {
        path: 'add-coupon',
        loadComponent: () => import('./add-coupon/add-coupon').then(m => m.AddCouponComponent),
      },
      {
        path: 'allorder',
        loadComponent: () => import('./pages/allorder/allorder').then(m => m.Allorder),
      },
      {
        path: 'coupons',
        loadComponent: () => import('./show-coupons/show-coupons').then(m => m.ShowCoupons),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings').then(m => m.Settings),
      },
      {
        path: 'edit-coupon/:id',
        loadComponent: () => import('./edit-coupon/edit-coupon').then(m => m.EditCouponComponent),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
