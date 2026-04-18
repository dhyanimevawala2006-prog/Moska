import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../service/category-service';

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
  readonly fallbackImg = 'assets/no-image.png';

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
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
      error: () => {}
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
}

