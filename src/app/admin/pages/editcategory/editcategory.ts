import { CommonModule, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../service/category-service';
import { ValidationMessage } from '../../../validation-message/validation-message';
import { MSwal as Swal } from '../../../service/swal-service';

@Component({
  selector: 'app-edit-category',
  standalone: true,
  imports:[CommonModule, ReactiveFormsModule, RouterLink, ValidationMessage, NgIf],
  templateUrl: './editcategory.html',
  styleUrls: ['./editcategory.css']
})
export class EditCategory implements OnInit {

  frmGrp!: FormGroup;
  selectedFile!: File;
  id!: string;
  oldImage: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.frmGrp = this.fb.group({
      cat_name: ['', Validators.required],
      cat_pic: ['']
    });

    // Get ID from URL
    this.id = this.route.snapshot.paramMap.get('id')!;

    console.log('Edit Category ID:', this.id);
    this.getSingleCategory();
  }

  // Get Single Category Data
  getSingleCategory() {
    this.categoryService.getSingleCategory(this.id).subscribe({
      next: (res: any) => {
        console.log('Category data received:', res);
        const data = res.data;
        this.frmGrp.patchValue({
          cat_name: data.cat_name
        });
        this.oldImage = data.cat_pic;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading category:', err);
        Swal.fire({ icon: 'error', title: 'Load Failed', text: 'Failed to load category data', confirmButtonColor: '#9B7B5E' });
      }
    });
  }

  // File Change
  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      console.log('File selected:', this.selectedFile.name);
    }
  }

  // Update Category (with FormData for multer)
  onUpdate() {
    if (this.frmGrp.invalid) {
      Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please fill in all required fields', confirmButtonColor: '#9B7B5E' });
      return;
    }
    const formData = new FormData();
    formData.append('cat_name', this.frmGrp.value.cat_name);
    if (this.selectedFile) formData.append('cat_pic', this.selectedFile);
    this.categoryService.updateCategory(this.id, formData).subscribe({
      next: (res: any) => {
        Swal.fire({ icon: 'success', title: 'Category Updated!', timer: 1500, showConfirmButton: false })
          .then(() => this.router.navigate(['/admin/category']));
      },
      error: (err) => {
        console.error('Update error:', err);
        Swal.fire({ icon: 'error', title: 'Update Failed', text: err.error?.message || err.message, confirmButtonColor: '#9B7B5E' });
      }
    });
  }

  
}