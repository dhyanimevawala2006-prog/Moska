import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProductService } from '../../../service/product-service';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { WishlistService } from '../../../service/wishlist-service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class Product implements OnInit {
  products: any[] = [];
  baseUrl = 'http://localhost:3000/uploads/';
  userId = sessionStorage.getItem('id');
  id: string = '';
  searchQuery: string = '';
  sortBy: string = 'default';

  get filteredProducts(): any[] {
    let list = this.products;

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.pname?.toLowerCase().includes(q) ||
        p.category?.cat_name?.toLowerCase().includes(q)
      );
    }

    list = [...list];
    switch (this.sortBy) {
      case 'price-asc':  list.sort((a, b) => +a.price - +b.price); break;
      case 'price-desc': list.sort((a, b) => +b.price - +a.price); break;
      case 'name-asc':   list.sort((a, b) => a.pname?.localeCompare(b.pname)); break;
      case 'name-desc':  list.sort((a, b) => b.pname?.localeCompare(a.pname)); break;
    }

    return list;
  }

  constructor(
    private productService: ProductService,
    public router: Router,
    private wishlistService: WishlistService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
    if (this.userId) {
      this.wishlistService.load(this.userId);
    }
  }

  loadProducts() {
    this.id = this.route.snapshot.params['id'];
    this.productService.getcatById(this.id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.products = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading products:', err)
    });
  }

  isWishlisted(productId: string): boolean {
    return this.wishlistService.isWishlisted(productId);
  }

  toggleWishlist(event: Event, productId: string) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.userId) { this.router.navigate(['/login']); return; }
    this.wishlistService.toggle(this.userId, productId).subscribe({
      next: (res: any) => {
        const ids = (res.data || []).map((p: any) => (p._id || p).toString());
        this.wishlistService.updateIds(ids);
      }
    });
  }
}
