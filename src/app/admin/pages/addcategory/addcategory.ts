import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryService } from '../../../service/category-service';
import { CommonModule, NgIf } from '@angular/common';
import { ValidationMessage } from '../../../validation-message/validation-message';
import { MSwal as Swal } from '../../../service/swal-service';

@Component({
  selector: 'app-addcategory',
  standalone: true,  // ✅ Make it standalone
  imports: [ReactiveFormsModule, ValidationMessage, NgIf, CommonModule],
  templateUrl: './addcategory.html',
  styleUrls: ['./addcategory.css'], // ✅ styleUrls not styleUrl
})
export class Addcategory {

  frmGrp!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private catser: CategoryService,
    private router: Router
  ) {
    this.frmGrp = this.fb.group({
      cat_name: ['', Validators.required],
      cat_pic: ['', Validators.required]
    });
  }

  onsubmit(): void {
    this.frmGrp.markAllAsTouched();

    if (this.frmGrp.valid) {
      const formData = new FormData();
      formData.append('cat_name', this.frmGrp.get('cat_name')?.value);
      formData.append('cat_pic', this.frmGrp.get('cat_pic')?.value);

      this.catser.add(formData).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Category Added!', timer: 1500, showConfirmButton: false })
            .then(() => this.router.navigate(['/admin/category']));
        },
        error: (err) => {
          console.error(err);
          Swal.fire({ icon: 'error', title: 'Failed', text: 'Failed to add category', confirmButtonColor: '#9B7B5E' });
        }
      });
    }
  }

  // Capture file
  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.frmGrp.patchValue({
        cat_pic: event.target.files[0]
      });
    }
  }
}