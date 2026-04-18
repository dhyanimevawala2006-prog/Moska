import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { WishlistService } from '../../../service/wishlist-service';
import { ProductService } from '../../../service/product-service';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterLink]
})
export class Wishlist implements OnInit {
  imageUrl = ''; // images are now full Cloudinary URLs stored in product.pic1
  readonly fallbackImg = 'assets/no-image.png';

  products$!: Observable<any[]>;

  constructor(
    private wishlistService: WishlistService,
    private productService: ProductService,
    private router: Router,
  ) {}

  ngOnInit() {
    const userId = sessionStorage.getItem('id');
    if (!userId) { this.router.navigate(['/login']); return; }

    this.products$ = combineLatest([
      this.wishlistService.wishlistIds$,
      this.productService.getAllProducts()
    ]).pipe(
      map(([ids, res]: [string[], any]) => {
        const all: any[] = res?.data ?? res ?? [];
        return all.filter(p => ids.includes(p._id));
      })
    );
  }

  remove(productId: string) {
    this.wishlistService.toggle(productId);
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
}
