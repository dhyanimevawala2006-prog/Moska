import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../service/product-service';
import { OrderService } from '../../../service/order-service';
import { CategoryService } from '../../../service/category-service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit, OnDestroy {
  totalProducts = 0;
  totalOrders   = 0;
  totalCategories = 0;
  categories: any[] = [];

  currentYear = new Date().getFullYear();
  currentTime = '';
  private clockInterval: any;
  private isDestroyed = false;

  // collapsible sections on mobile
  openSections: Record<string, boolean> = {
    manage: false,
    support: false,
  };

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.productService.getAllProducts().subscribe({
      next: (res: any) => this.deferUiUpdate(() => {
        this.totalProducts = (res?.data ?? res ?? []).length;
      }),
      error: () => {}
    });

    this.orderService.getAllOrders().subscribe({
      next: (res: any) => this.deferUiUpdate(() => {
        this.totalOrders = (res?.data ?? res ?? []).length;
      }),
      error: () => {}
    });

    this.categoryService.get().subscribe({
      next: (res: any) => this.deferUiUpdate(() => {
        const list = res?.data ?? res ?? [];
        this.totalCategories = list.length;
        this.categories = list;
      }),
      error: () => {}
    });

    this.deferUiUpdate(() => this.updateTime());
    this.clockInterval = setInterval(() => {
      if (this.isDestroyed) return;
      this.updateTime();
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    clearInterval(this.clockInterval);
  }

  private deferUiUpdate(update: () => void) {
    setTimeout(() => {
      if (this.isDestroyed) return;
      update();
      this.cdr.detectChanges();
    });
  }

  private updateTime() {
    this.currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  toggle(section: string) {
    this.openSections[section] = !this.openSections[section];
  }
}
