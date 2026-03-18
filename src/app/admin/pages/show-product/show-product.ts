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
  apiUrl = 'http://localhost:3000/api/product/getall';

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        console.log('✅ Response:', response);
        
        // Assign products
        if (response && response.data) {
          this.products = [...response.data]; // Create new array
        } else if (Array.isArray(response)) {
          this.products = [...response];
        } else {
          this.products = [];
        }
        
        console.log('📦 Products assigned:', this.products.length);
        console.log('📋 Products:', this.products);
        
        // Force change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.products = [];
        this.cdr.detectChanges();
      }
    });
  }

  filteredProducts() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      return this.products;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.products.filter(p =>
      p.pname?.toLowerCase().includes(term) ||
      p.category?.cat_name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.price?.toString().includes(term)
    );
  }

  getCategoryIcon(category: any): string {
    const catName = (category?.cat_name || '').toLowerCase();
    if (catName.includes('clothes')) return 'tshirt';
    if (catName.includes('electronic')) return 'microchip';
    if (catName.includes('medicine')) return 'capsules';
    if (catName.includes('jewellery')) return 'gem';
    if (catName.includes('toy')) return 'puzzle-piece';
    if (catName.includes('beauty')) return 'spray-can-sparkles';
    return 'box';
  }

  viewImage(filename: string) {
    window.open('http://localhost:3000/uploads/' + filename, '_blank');
  }

  viewProduct(id: string) {
    console.log('View product:', id);
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
        this.http.delete(`http://localhost:3000/api/product/delete/${id}`).subscribe({
          next: () => {
            this.products = this.products.filter(p => p._id !== id);
            this.cdr.detectChanges();
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
          },
          error: (err) => {
            console.error('❌ Delete error:', err);
            Swal.fire({ icon: 'error', title: 'Failed', text: 'Failed to delete product', confirmButtonColor: '#9B7B5E' });
          }
        });
      }
    });
  }

  getTotalStock(): number {
    return this.products.reduce((sum, p) => sum + (p.stock || 0), 0);
  }

  getAveragePrice(): string {
    if (this.products.length === 0) return '0.00';
    const total = this.products.reduce((sum, p) => sum + (p.price || 0), 0);
    return (total / this.products.length).toFixed(2);
  }
}
