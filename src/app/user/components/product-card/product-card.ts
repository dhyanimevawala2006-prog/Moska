import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../../../service/wishlist-service';
import { MSwal as Swal } from '../../../service/swal-service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent implements OnInit {
  @Input() product: any;
  @Input() selectedColor: string = '';

  @Output() addToCart     = new EventEmitter<Event>();
  @Output() colorSelected = new EventEmitter<{ event: Event; color: any }>();
  @Output() cardClicked   = new EventEmitter<Event>();

  readonly baseUrl = '';   // images are now full Cloudinary URLs — no prefix needed
  readonly fallbackImg = 'assets/no-image.png';

  isWishlisted$!: Observable<boolean>;

  constructor(
    private wishlistService: WishlistService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.isWishlisted$ = this.wishlistService.wishlistIds$.pipe(
      map(ids => ids.includes(this.product?._id))
    );
  }

  private isCloudinaryImage(url: string | null | undefined): boolean {
    return typeof url === 'string' && url.startsWith('http');
  }

  private getProductImage(url: string | null | undefined): string {
    return typeof url === 'string' && this.isCloudinaryImage(url) ? url : this.fallbackImg;
  }

  get cardImage(): string {
    if (this.selectedColor && this.product?.colors?.length) {
      const match = this.product.colors.find(
        (c: any) => (c.color ?? c) === this.selectedColor
      );
      if (this.isCloudinaryImage(match?.image)) {
        return match.image;
      }
    }
    return this.getProductImage(this.product?.pic1);
  }

  get hoverImage(): string {
    return this.getProductImage(this.product?.picHover || this.product?.pic1);
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.src = this.fallbackImg;
    }
  }

  onCardClick(e: Event)  { this.cardClicked.emit(e); }
  onAddToCart(e: Event)  { e.preventDefault(); e.stopPropagation(); this.addToCart.emit(e); }
  onColorSelect(e: Event, color: any) {
    e.preventDefault(); e.stopPropagation();
    this.colorSelected.emit({ event: e, color });
  }

  onToggleWishlist(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    const userId = sessionStorage.getItem('id');
    if (!userId) { this.router.navigate(['/login']); return; }

    this.wishlistService.toggle(this.product?._id);
  }
}
