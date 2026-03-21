import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLayout } from './layout/user-layout/user-layout';
import { Home } from './pages/home/home';
import { Contact } from './pages/contact/contact';
import { About } from './pages/about/about';
import { Product } from './pages/product/product';
import { Cart } from './pages/cart/cart';
import { Category } from './pages/category/category';
import { ProductDetails } from './pages/product-details/product-details';
import { Myorder } from './pages/myorder/myorder';
import { Profile } from './pages/profile/profile';
import { Wishlist } from './pages/wishlist/wishlist';
import { Checkout } from './pages/checkout/checkout';
import { Explore } from './pages/explore/explore';

const routes: Routes = [
    {
    path: '',
    component: UserLayout,
    children: [
      { path: '', component: Home },
      { path: 'home', component: Home },
      { path: 'contact', component: Contact },
      { path: 'category', component: Category },
      { path: 'about', component: About },
      { path: 'products/:id', component: Product },
      { path: 'productdetails/:id', component: ProductDetails },
      { path: 'cart', component: Cart },
      { path: 'checkout', component: Checkout },
      { path: 'myorder', component: Myorder },
      { path: 'profile', component: Profile },
      { path: 'wishlist', component: Wishlist },
      { path: 'about1', component: About },
      { path: 'explore', component: Explore }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
