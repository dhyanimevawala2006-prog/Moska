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

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('🎯 Category component constructor called');
  }

  ngOnInit() {
    console.log('🚀 Category component ngOnInit called');
    this.loadCategories();
  }

  loadCategories() {
    console.log('🔄 Loading categories from API...');
    this.categoryService.get().subscribe({
      next: (res: any) => {
        console.log('✅ Categories API Response:', res);
        this.categories = res;
        this.filteredCategories = [...res];
        console.log('📦 Categories array:', this.categories);
        console.log('📊 Total categories:', this.categories.length);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading categories:', err);
        console.error('Error details:', err.message);
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
}

