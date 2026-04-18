import { ChangeDetectorRef, Component } from '@angular/core';
import { NgFor, NgIf, DatePipe, SlicePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../service/order-service';
import { InvoiceService } from '../../../service/invoice-service';
import { MSwal as Swal } from '../../../service/swal-service';

@Component({
  selector: 'app-myorder',
  templateUrl: './myorder.html',
  styleUrls: ['./myorder.css'],
  imports: [NgFor, NgIf, DatePipe, SlicePipe, RouterLink, NgClass]
})
export class Myorder {

  orders: any[] = [];
  userId = sessionStorage.getItem('id');
  imageUrl = ''; // images are now full Cloudinary URLs stored in product.pic1
  readonly fallbackImg = 'assets/no-image.png';

  trackingSteps = [
    { label: 'Ordered',   icon: 'fas fa-check',         key: 'pending'    },
    { label: 'Preparing', icon: 'fas fa-box-open',       key: 'preparing'  },
    { label: 'Shipped',   icon: 'fas fa-shipping-fast',  key: 'shipped'    },
    { label: 'Delivered', icon: 'fas fa-home',           key: 'delivered'  },
  ];

  constructor(
    private orderService: OrderService,
    private invoiceService: InvoiceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.getOrders(); }

  getOrders() {
    if (!this.userId) return;
    this.orderService.getUserOrders(this.userId).subscribe({
      next: (res: any) => { this.orders = res.data || []; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  getStepIndex(status: string): number {
    const map: any = { pending: 0, preparing: 1, shipped: 2, delivered: 3 };
    return map[status?.toLowerCase()] ?? 0;
  }

  getProductImage(url: string | null | undefined): string {
    return typeof url === 'string' && url.startsWith('http') ? url : this.fallbackImg;
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.src = this.fallbackImg;
    }
  }

  canCancel(status: string): boolean {
    return ['Pending', 'Preparing'].includes(status);
  }

  cancelOrder(orderId: string) {
    Swal.fire({
      title: 'Cancel this order?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c85a54',
      cancelButtonColor: '#9B7B5E',
      confirmButtonText: 'Yes, cancel it',
      cancelButtonText: 'Keep order'
    }).then(result => {
      if (result.isConfirmed) {
        this.orderService.cancelOrder(orderId).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Order Cancelled', timer: 1500, showConfirmButton: false });
            this.getOrders();
          },
          error: () => Swal.fire({ icon: 'error', title: 'Failed to cancel order' })
        });
      }
    });
  }

  downloadInvoice(order: any, index: number) {
    this.invoiceService.openInvoice(order, index);
  }
}
