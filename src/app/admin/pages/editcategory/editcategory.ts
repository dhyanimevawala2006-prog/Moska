import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../service/category-service';
import { ValidationMessage } from '../../../validation-message/validation-message';
import { MSwal as Swal } from '../../../service/swal-service';

@Component({
  selector: 'app-edit-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ValidationMessage],
  templateUrl: './editcategory.html',
  styleUrls: ['./editcategory.css'],
})
export class EditCategory implements OnInit {

  frmGrp!: FormGroup;
  selectedFile: File | null = null;   // store file directly
  selectedFileName: string = '';
  id!: string;
  oldImage: string = '';              // full Cloudinary URL of current image
  readonly fallbackImg = 'assets/no-image.png';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.frmGrp = this.fb.group({
      cat_name: ['', Validators.required],
    });

    this.id = this.route.snapshot.paramMap.get('id')!;
    this.getSingleCategory();
  }

  getSingleCategory() {
    this.categoryService.getSingleCategory(this.id).subscribe({
      next: (res: any) => {
        const data = res.data;
        this.frmGrp.patchValue({ cat_name: data.cat_name });
        this.oldImage = data.cat_pic || '';   // full Cloudinary URL
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Load Failed', text: 'Failed to load category data', confirmButtonColor: '#9B7B5E' });
      }
    });
  }

  onFileChange(event: any) {
    const file: File = event.target.files?.[0];
    if (file) {
      this.selectedFile     = file;
      this.selectedFileName = file.name;
      this.cdr.detectChanges();
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

  onUpdate() {
    this.frmGrp.markAllAsTouched();
    if (this.frmGrp.invalid) {
      Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please fill in all required fields', confirmButtonColor: '#9B7B5E' });
      return;
    }

    // Build FormData — field name MUST match upload.single('cat_pic')
    const formData = new FormData();
    formData.append('cat_name', this.frmGrp.value.cat_name);
    if (this.selectedFile) {
      formData.append('cat_pic', this.selectedFile, this.selectedFile.name);
    }

    this.categoryService.updateCategory(this.id, formData).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Category Updated!', timer: 1500, showConfirmButton: false })
          .then(() => this.router.navigate(['/admin/category']));
      },
      error: (err: any) => {
        console.error('Update category error:', err);
        Swal.fire({ icon: 'error', title: 'Update Failed', text: err?.error?.message || err.message, confirmButtonColor: '#9B7B5E' });
      }
    });
  }
}
