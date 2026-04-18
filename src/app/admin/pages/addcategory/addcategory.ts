import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../service/category-service';
import { CommonModule } from '@angular/common';
import { ValidationMessage } from '../../../validation-message/validation-message';
import { MSwal as Swal } from '../../../service/swal-service';

@Component({
  selector: 'app-addcategory',
  standalone: true,
  imports: [ReactiveFormsModule, ValidationMessage, CommonModule, RouterLink],
  templateUrl: './addcategory.html',
  styleUrls: ['./addcategory.css'],
})
export class Addcategory {

  frmGrp!: FormGroup;
  selectedFile: File | null = null;   // store file directly — not in form control
  selectedFileName: string = '';

  constructor(
    private fb: FormBuilder,
    private catser: CategoryService,
    private router: Router
  ) {
    this.frmGrp = this.fb.group({
      cat_name: ['', Validators.required],
    });
  }

  /** Called when user picks a file */
  onFileChange(event: any): void {
    const file: File = event.target.files?.[0];
    if (file) {
      this.selectedFile     = file;
      this.selectedFileName = file.name;
    }
  }

  onsubmit(): void {
    this.frmGrp.markAllAsTouched();

    if (!this.frmGrp.valid) return;

    if (!this.selectedFile) {
      Swal.fire({ icon: 'warning', title: 'Image Required', text: 'Please select a category image.', confirmButtonColor: '#9B7B5E' });
      return;
    }

    // Build FormData — field name MUST match upload.single('cat_pic')
    const formData = new FormData();
    formData.append('cat_name', this.frmGrp.get('cat_name')!.value);
    formData.append('cat_pic',  this.selectedFile, this.selectedFile.name);

    this.catser.add(formData).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Category Added!', timer: 1500, showConfirmButton: false })
          .then(() => this.router.navigate(['/admin/category']));
      },
      error: (err: any) => {
        console.error('Add category error:', err);
        Swal.fire({ icon: 'error', title: 'Failed', text: err?.error?.message || 'Failed to add category', confirmButtonColor: '#9B7B5E' });
      }
    });
  }
}
