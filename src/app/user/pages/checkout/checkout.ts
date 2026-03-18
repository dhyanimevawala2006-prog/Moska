import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../service/order-service';
import { CartService } from '../../../service/cart-service';
import { MSwal as Swal } from '../../../service/swal-service';

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  userId = sessionStorage.getItem('id');
  userName = sessionStorage.getItem('name') || '';

  cartItems: any[] = [];
  total: number = 0;
  discount: number = 0;
  couponCode: string = '';
  finalTotal: number = 0;
  imageUrl = 'http://localhost:3000/uploads/';

  // Shipping form
  form = {
    name: this.userName,
    city: '',
    state: '',
    address: '',
    pincode: '',
  };

  pmode: string = 'cod';

  // City-wise delivery charges (case-insensitive match)
  private cityCharges: { [key: string]: number } = {
    // Free delivery cities
    'ahmedabad': 0, 'surat': 0, 'vadodara': 0, 'rajkot': 0, 'gandhinagar': 0,
    // Metro cities
    'mumbai': 40, 'delhi': 40, 'bangalore': 40, 'bengaluru': 40,
    'hyderabad': 40, 'chennai': 40, 'kolkata': 40, 'pune': 40,
    // Tier-2 cities
    'jaipur': 60, 'lucknow': 60, 'kanpur': 60, 'nagpur': 60, 'indore': 60,
    'bhopal': 60, 'patna': 60, 'agra': 60, 'nashik': 60, 'faridabad': 60,
    'meerut': 60, 'coimbatore': 60, 'vizag': 60, 'visakhapatnam': 60,
    'madurai': 60, 'varanasi': 60, 'amritsar': 60, 'allahabad': 60,
    'prayagraj': 60, 'ranchi': 60, 'howrah': 60, 'guwahati': 60,
    'chandigarh': 60, 'mysore': 60, 'mysuru': 60, 'jabalpur': 60,
    // Remote / NE / J&K
    'srinagar': 120, 'jammu': 120, 'leh': 150, 'shimla': 100,
    'dehradun': 80, 'rishikesh': 80, 'haridwar': 80,
    'port blair': 150, 'imphal': 120, 'aizawl': 120, 'kohima': 120,
    'itanagar': 120, 'gangtok': 120, 'agartala': 100, 'shillong': 100,
  };

  get deliveryCharge(): number {
    const city = this.form.city.trim().toLowerCase();
    if (!city) return 40; // default before city entered
    if (this.cityCharges.hasOwnProperty(city)) {
      return this.cityCharges[city];
    }
    return 80; // default for unknown cities
  }

  get deliveryLabel(): string {
    const city = this.form.city.trim().toLowerCase();
    if (!city) return '';
    if (this.cityCharges.hasOwnProperty(city)) {
      return this.cityCharges[city] === 0 ? 'FREE delivery to your city!' : '';
    }
    return '';
  }

  states = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
    'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
    'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
    'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
    'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
    'Andaman & Nicobar','Chandigarh','Delhi','Jammu & Kashmir','Ladakh',
    'Lakshadweep','Puducherry'
  ];

  constructor(
    private router: Router,
    private orderService: OrderService,
    private cartService: CartService,
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as any;
    if (state) {
      this.cartItems = state.cartItems || [];
      this.total = state.total || 0;
      this.discount = state.discount || 0;
      this.couponCode = state.couponCode || '';
      this.finalTotal = state.finalTotal || 0;
    }
  }

  ngOnInit(): void {
    if (!this.cartItems.length) {
      this.router.navigate(['/cart']);
    }
  }

  get grandTotal(): number {
    return this.total + this.deliveryCharge - this.discount;
  }

  isFormValid(): boolean {
    return !!(
      this.form.name.trim() &&
      this.form.city.trim() &&
      this.form.state &&
      this.form.address.trim() &&
      this.pmode
    );
  }

  placeOrder(): void {
    if (!this.isFormValid()) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Details',
        text: 'Please fill all required fields.',
        confirmButtonColor: '#9B7B5E',
      });
      return;
    }

    const orderData = {
      userId: this.userId,
      items: this.cartItems.map((item: any) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        color: item.color || '',
        size: item.size || '',
      })),
      total: this.total,
      discount: this.discount,
      couponCode: this.couponCode,
      finalTotal: this.grandTotal,
      paymentMethod: this.pmode,
      address: {
        name: this.form.name,
        city: this.form.city,
        state: this.form.state,
        address: this.form.address,
        pincode: this.form.pincode,
      },
    };

    if (this.pmode === 'online') {
      this.payOnline(orderData);
    } else {
      this.submitOrder(orderData);
    }
  }

  payOnline(orderData: any): void {
    const options = {
      key: 'rzp_test_SRmzTly79eUWgd',
      amount: this.grandTotal * 100,
      currency: 'INR',
      name: 'MOSKA',
      description: 'Order Payment',
      handler: () => {
        this.submitOrder(orderData);
      },
      prefill: {
        name: this.form.name,
        contact: '',
      },
      theme: { color: '#9B7B5E' },
    };
    const rzp = new Razorpay(options);
    rzp.open();
  }

  submitOrder(orderData: any): void {
    this.orderService.createOrder(orderData).subscribe({
      next: () => {
        this.cartService.clearCart(this.userId).subscribe();
        Swal.fire({
          icon: 'success',
          title: 'Order Placed! 🎉',
          text: 'Your order has been placed successfully.',
          confirmButtonText: 'View My Orders',
          confirmButtonColor: '#9B7B5E',
          showCancelButton: true,
          cancelButtonText: 'Continue Shopping',
          cancelButtonColor: '#C5A059',
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/myorder']);
          } else {
            this.router.navigate(['/']);
          }
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Order Failed',
          text: 'Something went wrong. Please try again.',
          confirmButtonColor: '#9B7B5E',
        });
      },
    });
  }
}
