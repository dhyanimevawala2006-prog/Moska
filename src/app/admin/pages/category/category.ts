import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../service/category-service';
import { MSwal as Swal } from '../../../service/swal-service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category implements OnInit {
  categories: any[] = [];
  filteredCategories: any[] = [];
  searchTerm: string = '';
  selectedImage: string = '';
  showImageModal: boolean = false;
  readonly fallbackImg = 'assets/no-image.png';

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.get().subscribe({
      next: (res: any) => {
        // GET /all now returns { success: true, data: [...] } consistently
        const data: any[] = res?.data ?? res;
        this.categories = Array.isArray(data) ? data : [];
        this.filteredCategories = [...this.categories];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  filterCategories() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredCategories = [...this.categories];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredCategories = this.categories.filter(cat =>
        cat.cat_name?.toLowerCase().includes(term)
      );
    }
  }

  getCategoryImage(catPic: string | null | undefined) {
    return catPic?.startsWith('http') ? catPic : this.fallbackImg;
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (img && !img.src.endsWith('assets/no-image.png')) {
      img.src = this.fallbackImg;
    }
  }

  viewImage(imageUrl: string) {
    this.selectedImage = this.getCategoryImage(imageUrl);
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
    this.selectedImage = '';
  }

  editCategory(id: string) {
    this.router.navigate(['/admin/editcategory', id]);
  }

  deleteCategory(id: string) {
    Swal.fire({
      title: 'Delete this category?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#c85a54', cancelButtonColor: '#9B7B5E',
      confirmButtonText: 'Yes, delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.categoryService.delete(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
            this.loadCategories();
          },
          error: (err) => {
            Swal.fire({ icon: 'error', title: 'Failed', text: 'Failed to delete category', confirmButtonColor: '#9B7B5E' });
          }
        });
      }
    });
  }
}
