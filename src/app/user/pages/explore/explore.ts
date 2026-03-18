import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../service/product-service';
import { CategoryService } from '../../../service/category-service';
import { WishlistService } from '../../../service/wishlist-service';
import { MSwal as Swal } from '../../../service/swal-service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './explore.html',
  styleUrls: ['./explore.css'],
})
export class Explore implements OnInit {
  allProducts: any[] = [];
  categories: any[] = [];
  wishlisted = new Set<string>();
  selectedColors: Record<string, string> = {}; // productId -> selected color hex

  // Filters
  searchQuery   = '';
  selectedCat   = '';
  sortBy        = 'default';
  minPrice      = 0;
  maxPrice      = 10000;
  priceMax      = 10000;
  viewMode: 'grid' | 'list' = 'grid';
  loading       = true;

  userId = sessionStorage.getItem('id');

  constructor(
    private pService: ProductService,
    private catService: CategoryService,
    public wishlistService: WishlistService,
    private cdr: ChangeDetectorRef,
    public router: Router,
  ) {}

  ngOnInit() {
    this.catService.get().subscribe({
      next: (res: any) => { this.categories = res; this.cdr.detectChanges(); },
      error: () => {}
    });

    this.pService.getAllProducts().subscribe({
      next: (res: any) => {
        this.allProducts = res.data || [];
        // set max price from data
        const prices = this.allProducts.map(p => +p.price).filter(Boolean);
        if (prices.length) {
          this.priceMax = Math.ceil(Math.max(...prices) / 100) * 100;
          this.maxPrice = this.priceMax;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });

    if (this.userId) {
      this.wishlistService.load(this.userId);
      this.wishlistService.wishlistIds$.subscribe(ids => {
        this.wishlisted = ids;
        this.cdr.detectChanges();
      });
    }
  }

  get filtered(): any[] {
    let list = [...this.allProducts];

    // category filter
    if (this.selectedCat) {
      list = list.filter(p => p.category?._id === this.selectedCat || p.category?.cat_name === this.selectedCat);
    }

    // search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.pname?.toLowerCase().includes(q) ||
        p.category?.cat_name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // price range
    list = list.filter(p => +p.price >= this.minPrice && +p.price <= this.maxPrice);

    // sort
    switch (this.sortBy) {
      case 'price-asc':  list.sort((a, b) => +a.price - +b.price); break;
      case 'price-desc': list.sort((a, b) => +b.price - +a.price); break;
      case 'name-asc':   list.sort((a, b) => a.pname?.localeCompare(b.pname)); break;
      case 'name-desc':  list.sort((a, b) => b.pname?.localeCompare(a.pname)); break;
    }

    return list;
  }

  get totalResults() { return this.filtered.length; }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCat = '';
    this.sortBy = 'default';
    this.minPrice = 0;
    this.maxPrice = this.priceMax;
  }

  isWishlisted(id: string) { return this.wishlisted.has(id); }

  toggleWishlist(e: Event, id: string) {
    e.preventDefault(); e.stopPropagation();
    if (!this.userId) { this.router.navigate(['/login']); return; }
    this.wishlistService.toggle(this.userId, id).subscribe({
      next: (res: any) =>
        this.wishlistService.updateIds((res.data || []).map((i: any) => i.toString())),
    });
  }

  addToCart(e: Event, p: any) {
    e.preventDefault(); e.stopPropagation();
    Swal.fire({
      icon: 'success', title: 'Added to Cart!', text: `${p.pname} added.`,
      timer: 1500, showConfirmButton: false, toast: true, position: 'top-end'
    });
  }

  imgUrl(pic: string) { return `http://localhost:3000/uploads/${pic}`; }

  selectColor(e: Event, productId: string, colorObj: any) {
    e.preventDefault(); e.stopPropagation();
    this.selectedColors[productId] = colorObj.color ?? colorObj;
    this.cdr.detectChanges();
  }

  getCardImage(p: any): string {
    const sel = this.selectedColors[p._id];
    if (sel && p.colors?.length) {
      const match = p.colors.find((c: any) => (c.color ?? c) === sel);
      if (match?.image && match.image !== 'no-image.jpg') return match.image;
    }
    return p.pic1;
  }

  navigateToDetails(e: Event, p: any) {
    e.preventDefault(); e.stopPropagation();
    const color = this.selectedColors[p._id] || '';
    this.router.navigate(['/productdetails', p._id], color ? { queryParams: { color } } : {});
  }

  countByCat(catId: string): number {
    return this.allProducts.filter(p => p.category?._id === catId).length;
  }
}
