import { Component, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductService } from '../../../service/product-service';
import { CouponService } from '../../../service/coupon-service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../service/theme-service';
import { MSwal as Swal } from '../../../service/swal-service';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [NgFor, NgIf, FormsModule, RouterLink, ProductCardComponent],
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
  readonly fallbackImg = 'assets/no-image.png';

  selectColor(e: Event, productId: string, colorObj: any) {
    e.preventDefault(); e.stopPropagation();
    this.selectedColors[productId] = colorObj.color ?? colorObj;
    this.cdr.detectChanges();
  }

  getCardImage(p: any): string {
    const sel = this.selectedColors[p._id];
    if (sel && p.colors?.length) {
      const match = p.colors.find((c: any) => (c.color ?? c) === sel);
      if (this.isCloudinaryImage(match?.image)) {
        return match.image; // full Cloudinary URL
      }
    }
    return this.getProductImage(p.pic1);
  }

  private isCloudinaryImage(url: string | null | undefined): boolean {
    return typeof url === 'string' && url.startsWith('http');
  }

  private getProductImage(url: string | null | undefined): string {
    return typeof url === 'string' && this.isCloudinaryImage(url) ? url : this.fallbackImg;
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

  constructor(
    private pservice: ProductService,
    private couponService: CouponService,
    public router: Router,
    private cdr: ChangeDetectorRef,
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
      error: () => {},
    });

    // ⭐ LOAD POPULAR COUPONS
    this.couponService.getPopularCoupons().subscribe({
      next: (res: any) => {
        this.coupons = Array.isArray(res) ? res : (res.data || []);
        this.cdr.detectChanges();
      },
      error: () => {},
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
