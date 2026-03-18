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
        this.categories = res;
        this.filteredCategories = [...res];
        this.cdr.detectChanges(); 
        console.log('✅ Categories loaded:', this.categories);
        console.log('First category:', this.categories[0]);
      },
      error: (err) => console.error('❌ Error loading categories:', err)
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

  viewImage(imagePath: string) {
    console.log('🖼️ Image clicked!');
    console.log('Image path:', imagePath);
    this.selectedImage = 'http://localhost:3000/uploads/' + imagePath;
    this.showImageModal = true;
    console.log('Modal should show:', this.showImageModal);
    console.log('Selected image:', this.selectedImage);
  }

  closeImageModal() {
    this.showImageModal = false;
    this.selectedImage = '';
  }

  editCategory(id: string) {
    console.log('🔵 Edit button clicked!');
    console.log('🔵 Category ID:', id);
    console.log('🔵 Navigating to: /admin/editcategory/' + id);
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
            console.error('Delete error:', err);
            Swal.fire({ icon: 'error', title: 'Failed', text: 'Failed to delete category', confirmButtonColor: '#9B7B5E' });
          }
        });
      }
    });
  }
}