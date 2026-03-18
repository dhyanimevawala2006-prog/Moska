import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing-module';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UserRoutingModule,Footer,Header
  ]
})
export class UserModule { }
