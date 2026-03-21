import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MSwal as Swal } from '../../../service/swal-service';

@Component({
  selector: 'app-show-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './show-product.html',
  styleUrls: ['./show-product.css']
})
export class ShowProduct implements OnInit {
  products: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  togglingIds: Set<string> = new Set();
  toast: { message: string; type: string } | null = null;
  private toastTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.http.get<any>('http://localhost:3000/api/products/getall').subscribe({
      next: (res) => {
        this.products = res?.data ? [...res.data] : Array.isArray(res) ? [...res] : [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.products = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filteredProducts() {
    if (!this.searchTerm?.trim()) return this.products;
    const term = this.searchTerm.toLowerCase().trim();
    return this.products.filter(p =>
      p.pname?.toLowerCase().includes(term) ||
      p.category?.cat_name?.toLowerCase().includes(term) ||
      p.price?.toString().includes(term)
    );
  }

  getCategoryIcon(category: any): string {
    const n = (category?.cat_name || '').toLowerCase();
    if (n.includes('clothes')) return 'tshirt';
    if (n.includes('electronic')) return 'microchip';
    if (n.includes('medicine')) return 'capsules';
    if (n.includes('jewellery')) return 'gem';
    if (n.includes('toy')) return 'puzzle-piece';
    if (n.includes('beauty')) return 'spray-can-sparkles';
    return 'box';
  }

  viewImage(filename: string) {
    window.open('http://localhost:3000/uploads/' + filename, '_blank');
  }

  editProduct(id: string) {
    this.router.navigate(['/admin/editproduct', id]);
  }

  deleteProduct(id: string) {
    Swal.fire({
      title: 'Delete this product?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#c85a54', cancelButtonColor: '#9B7B5E',
      confirmButtonText: 'Yes, delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost:3000/api/products/delete/${id}`).subscribe({
          next: () => {
            this.products = this.products.filter(p => p._id !== id);
            this.cdr.detectChanges();
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
          },
          error: () => {
            Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not delete product', confirmButtonColor: '#9B7B5E' });
          }
        });
      }
    });
  }

  onTogglePopular(product: any) {
    if (this.togglingIds.has(product._id)) return;
    const newValue = !product.popular;
    product.popular = newValue;
    this.togglingIds.add(product._id);

    const formData = new FormData();
    formData.append('popular', newValue.toString());

    this.http.put(`http://localhost:3000/api/products/update/${product._id}`, formData).subscribe({
      next: () => {
        this.togglingIds.delete(product._id);
        this.showToast(newValue ? '⭐ Marked as Popular' : '✖ Removed from Popular', newValue ? 'success' : 'info');
        this.cdr.detectChanges();
      },
      error: () => {
        product.popular = !newValue;
        this.togglingIds.delete(product._id);
        this.showToast('Failed to update popular status', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  showToast(message: string, type: string) {
    this.toast = { message, type };
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toast = null; this.cdr.detectChanges(); }, 2500);
  }

  getTotalStock(): number {
    return this.products.reduce((sum, p) => sum + (p.stock || 0), 0);
  }

  getAveragePrice(): string {
    if (!this.products.length) return '0.00';
    return (this.products.reduce((s, p) => s + (p.price || 0), 0) / this.products.length).toFixed(2);
  }

  getPopularCount(): number {
    return this.products.filter(p => p.popular).length;
  }
}
