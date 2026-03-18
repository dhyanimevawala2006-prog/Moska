import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private url = 'http://localhost:3000/api/ratings';

  constructor(private http: HttpClient) {}

  getReviews(productId: string) {
    return this.http.get(`${this.url}/${productId}`);
  }

  addReview(productId: string, data: { userName: string; rating: number; title: string; comment: string }) {
    return this.http.post(`${this.url}/${productId}`, data);
  }
}
