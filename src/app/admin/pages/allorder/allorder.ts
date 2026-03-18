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
  imageUrl = 'http://localhost:3000/uploads/';
  searchText: string = '';

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
      error: (err) => console.log(err)
    });
  }

  updateStatus(orderId: any, status: any) {
    this.orderService.updateStatus(orderId, status).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Status Updated', timer: 1200, showConfirmButton: false });
        this.getOrders();
      },
      error: (err) => console.log(err)
    });
  }
}
