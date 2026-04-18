import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../service/order-service';
import { MSwal as Swal } from '../../../service/swal-service';

@Component({
  selector: 'app-allorder',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './allorder.html',
  styleUrl: './allorder.css',
})
export class Allorder {
  orders: any[] = [];
  searchText: string = '';
  readonly fallbackImg = 'assets/no-image.png';

  constructor(private orderService: OrderService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getOrders();
  }

  get filteredOrders() {
    if (!this.searchText.trim()) return this.orders;
    const q = this.searchText.toLowerCase();
    return this.orders.filter(o =>
      o.userId?.name?.toLowerCase().includes(q) ||
      o.userId?.email?.toLowerCase().includes(q) ||
      o._id?.toLowerCase().includes(q)
    );
  }

  getOrders() {
    this.orderService.getAllOrders().subscribe({
      next: (res: any) => {
        this.orders = res.data || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  updateStatus(orderId: any, status: any) {
    this.orderService.updateStatus(orderId, status).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Status Updated', timer: 1200, showConfirmButton: false });
        this.getOrders();
      },
      error: () => {}
    });
  }

  getProductImage(pic: string | null | undefined) {
    return pic?.startsWith('http') ? pic : this.fallbackImg;
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.src = this.fallbackImg;
    }
  }
}
