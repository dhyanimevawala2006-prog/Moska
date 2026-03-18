import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { WishlistService } from '../../../service/wishlist-service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
  imports: [NgFor, NgIf, RouterLink]
})
export class Wishlist implements OnInit {
  products: any[] = [];
  userId = sessionStorage.getItem('id');
  imageUrl = 'http://localhost:3000/uploads/';

  constructor(
    private wishlistService: WishlistService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.userId) { this.router.navigate(['/login']); return; }
    this.load();
  }

  load() {
    this.wishlistService.getWishlist(this.userId!).subscribe({
      next: (res: any) => {
        console.log('Wishlist response:', res);
        this.products = res.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Wishlist error:', err)
    });
  }

  remove(productId: string) {
    this.wishlistService.toggle(this.userId!, productId).subscribe({
      next: () => this.load(),
      error: (err) => console.error('Remove error:', err)
    });
  }
}
