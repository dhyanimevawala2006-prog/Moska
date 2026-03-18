import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private apiUrl = 'http://localhost:3000/api/wishlist/';
  private wishlistIds = new BehaviorSubject<Set<string>>(new Set());
  wishlistIds$ = this.wishlistIds.asObservable();

  constructor(private http: HttpClient) {}

  load(userId: string) {
    this.getWishlist(userId).subscribe({
      next: (res: any) => {
        const ids = new Set<string>((res.data || []).map((p: any) => (p._id || p).toString()));
        this.wishlistIds.next(ids);
      }
    });
  }

  getWishlist(userId: string): Observable<any> {
    return this.http.get(this.apiUrl + userId);
  }

  toggle(userId: string, productId: string): Observable<any> {
    return this.http.post(this.apiUrl + 'toggle', { userId, productId });
  }

  isWishlisted(productId: string): boolean {
    return this.wishlistIds.value.has(productId);
  }

  updateIds(ids: string[]) {
    this.wishlistIds.next(new Set(ids));
  }
}
