import { Component, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductService } from '../../../service/product-service';
import { CouponService } from '../../../service/coupon-service';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotComponent } from '../../../chatbot/chatbot';
import { Router, RouterLink } from '@angular/router';
import { WishlistService } from '../../../service/wishlist-service';
import { ThemeService } from '../../../service/theme-service';
import { MSwal as Swal } from '../../../service/swal-service';

@Component({
  selector: 'app-home',
  imports: [NgFor, NgClass, NgIf, FormsModule, ChatbotComponent, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements AfterViewInit, OnInit {
  currentIndex = 0;
  slides: any;
  products: any[] = [];
  displayProducts: any[] = []; // random 5 popular products shown on home
  coupons: any[] = [];
  searchQuery: string = '';
  sortBy: string = 'default';
  selectedColors: Record<string, string> = {};
  readonly HOME_LIMIT = 5;

  selectColor(e: Event, productId: string, colorObj: any) {
    e.preventDefault(); e.stopPropagation();
    this.selectedColors[productId] = colorObj.color ?? colorObj;
    this.cdr.detectChanges();
  }

  getCardImage(p: any): string {
    const sel = this.selectedColors[p._id];
    if (sel && p.colors?.length) {
      const match = p.colors.find((c: any) => (c.color ?? c) === sel);
      if (match?.image && match.image !== 'no-image.jpg') {
        return 'http://localhost:3000/uploads/' + match.image;
      }
    }
    return 'http://localhost:3000/uploads/' + p.pic1;
  }

  navigateToDetails(e: Event, p: any) {
    e.preventDefault(); e.stopPropagation();
    const color = this.selectedColors[p._id] || '';
    this.router.navigate(['/productdetails', p._id], color ? { queryParams: { color } } : {});
  }

  private pickRandom5Popular() {
    const popular = this.products.filter(p => p.popular);
    // shuffle and take first 5
    const shuffled = [...popular].sort(() => Math.random() - 0.5);
    this.displayProducts = shuffled.slice(0, this.HOME_LIMIT);
  }

  get popularCount(): number {
    return this.products.filter(p => p.popular).length;
  }

  get filteredProducts(): any[] {
    let list = [...this.displayProducts];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.pname?.toLowerCase().includes(q) ||
        p.category?.cat_name?.toLowerCase().includes(q)
      );
    }

    switch (this.sortBy) {
      case 'price-asc':  list.sort((a, b) => +a.price - +b.price); break;
      case 'price-desc': list.sort((a, b) => +b.price - +a.price); break;
      case 'name-asc':   list.sort((a, b) => a.pname?.localeCompare(b.pname)); break;
      case 'name-desc':  list.sort((a, b) => b.pname?.localeCompare(a.pname)); break;
    }

    return list;
  }

  userId = sessionStorage.getItem('id');
  userName = sessionStorage.getItem('name');
  dropdownOpen = false;
  wishlisted = new Set<string>();

  constructor(
    private pservice: ProductService,
    private couponService: CouponService, // ⭐ NEW
    public router: Router,
    private cdr: ChangeDetectorRef,
    public wishlistService: WishlistService,
    public themeService: ThemeService,
  ) {}

  ngOnInit() {
    // PRODUCTS
    this.pservice.getAllProducts().subscribe({
      next: (res: any) => {
        this.products = res.data;
        this.pickRandom5Popular();
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err),
    });

    // ⭐ LOAD POPULAR COUPONS
    this.couponService.getPopularCoupons().subscribe({
      next: (res: any) => {
        console.log('Coupons API response:', res);
        this.coupons = Array.isArray(res) ? res : (res.data || []);
        console.log('Coupons array:', this.coupons);
        this.cdr.detectChanges();
      },
      error: (err) => console.log('Coupon error:', err),
    });

    if (this.userId) {
      this.wishlistService.load(this.userId);
      this.wishlistService.wishlistIds$.subscribe((ids) => {
        this.wishlisted = ids;
        this.cdr.detectChanges();
      });
    }
  }

  isWishlisted(id: string): boolean {
    return this.wishlisted.has(id);
  }

 

  toggleWishlist(event: Event, productId: string) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }
    this.wishlistService.toggle(this.userId, productId).subscribe({
      next: (res: any) =>
        this.wishlistService.updateIds((res.data || []).map((id: any) => id.toString())),
    });
  }
  copyCoupon(code: string) {
    navigator.clipboard.writeText(code);
    Swal.fire({
      icon: 'success', title: 'Copied!', text: `Coupon code "${code}" copied to clipboard.`,
      timer: 1800, showConfirmButton: false, toast: true, position: 'top-end'
    });
  }

  addToCart(e: Event, p: any) {
    e.preventDefault(); e.stopPropagation();
    Swal.fire({
      icon: 'success', title: 'Added to Cart!', text: `${p.pname} added.`,
      timer: 1500, showConfirmButton: false, toast: true, position: 'top-end'
    });
  }

  ngAfterViewInit() {
    this.slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');

    const showSlide = (index: number) => {
      if (index >= this.slides.length) index = 0;
      if (index < 0) index = this.slides.length - 1;

      this.slides.forEach((slide: any, i: number) => {
        slide.classList.toggle('active', i === index);
      });

      dots.forEach((dot: any, i: number) => {
        dot.classList.toggle('active', i === index);
      });

      this.currentIndex = index;
    };

    const nextSlide = () => showSlide(this.currentIndex + 1);

    setInterval(nextSlide, 5000);

    showSlide(0);
  }
}
