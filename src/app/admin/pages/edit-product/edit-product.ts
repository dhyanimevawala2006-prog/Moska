import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { MSwal as Swal } from '../../../service/swal-service';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, CommonModule, RouterLink],
  templateUrl: './edit-product.html',
  styleUrls: ['./edit-product.css']
})
export class EditProduct implements OnInit {
  productForm!: FormGroup;
  productId!: string;
  categories: any[] = [];
  
  mainFile!: File;
  hoverFile!: File;
  mainFileName: string = '';
  hoverFileName: string = '';
  currentMainImage: string = '';
  currentHoverImage: string = '';
  colorList: { color: string; image: File | null; preview: string; existingImage: string }[] = [
    { color: '#000000', image: null, preview: '', existingImage: '' }
  ];
  readonly fallbackImg = 'assets/no-image.png';
  
  baseUrl = 'https://moska-backend-cjqw.onrender.com'; // kept for API calls only

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.productForm = this.fb.group({
      pname: ['', Validators.required],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      oldPrice: [''],
      stock: [0, [Validators.min(0)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id')!;
    this.loadCategories();
    this.loadProduct();
  }

  loadCategories() {
    this.http.get<any>(`${this.baseUrl}/api/categories/all`).subscribe({
      next: (res: any) => {
        this.categories = res?.data ?? res;
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  loadProduct() {
    this.http.get<any>(`${this.baseUrl}/api/products/get/${this.productId}`).subscribe({
      next: (res: any) => {
        const product = res.data;
        
        this.productForm.patchValue({
          pname: product.pname,
          category: product.category?._id || product.category,
          price: product.price,
          oldPrice: product.oldPrice || '',
          stock: product.stock || 0,
          description: product.description
        });

        this.colorList = (product.colors && product.colors.length > 0)
          ? product.colors.map((c: any) => ({
              color: c.color ?? c,
              image: null,
              preview: '',
              existingImage: (typeof c.image === 'string' && c.image.startsWith('http')) ? c.image : ''
            }))
          : [{ color: '#000000', image: null, preview: '', existingImage: '' }];

        // pic1 and picHover are now full Cloudinary URLs
        this.currentMainImage  = product.pic1  || '';
        this.currentHoverImage = product.picHover || '';
      },
      error: (err) => {
        Swal.fire({ icon: 'error', title: 'Load Failed', text: 'Failed to load product', confirmButtonColor: '#9B7B5E' });
      }
    });
  }

  onMainFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.mainFile = event.target.files[0];
      this.mainFileName = this.mainFile.name;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.currentMainImage = reader.result as string;
      };
      reader.readAsDataURL(this.mainFile);
    }
  }

  onHoverFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.hoverFile = event.target.files[0];
      this.hoverFileName = this.hoverFile.name;
      const reader = new FileReader();
      reader.onload = () => { this.currentHoverImage = reader.result as string; };
      reader.readAsDataURL(this.hoverFile);
    }
  }

  addColor() { this.colorList.push({ color: '#000000', image: null, preview: '', existingImage: '' }); }

  removeColor(index: number) {
    if (this.colorList.length > 1) this.colorList.splice(index, 1);
  }

  updateColor(index: number, value: string) { this.colorList[index].color = value; }

  onColorImageChange(index: number, event: any) {
    const file = event.target.files[0];
    if (file) {
      this.colorList[index].image = file;
      const reader = new FileReader();
      reader.onload = () => { this.colorList[index].preview = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

  private isRenderableImage(url: string | null | undefined): boolean {
    return typeof url === 'string' && (url.startsWith('http') || url.startsWith('data:image/'));
  }

  getPreviewImage(url: string | null | undefined): string {
    return typeof url === 'string' && this.isRenderableImage(url) ? url : this.fallbackImg;
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.src = this.fallbackImg;
    }
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formData = new FormData();
      formData.append('pname', this.productForm.value.pname);
      formData.append('category', this.productForm.value.category);
      formData.append('price', this.productForm.value.price);
      formData.append('description', this.productForm.value.description);
      formData.append('stock', this.productForm.value.stock || '0');
      
      if (this.productForm.value.oldPrice) {
        formData.append('oldPrice', this.productForm.value.oldPrice);
      }

      this.colorList.forEach(c => {
        formData.append('colors[]', c.color);
        if (c.image) formData.append('colorImages', c.image);
      });

      if (this.mainFile) formData.append('pic', this.mainFile);
      if (this.hoverFile) formData.append('picHover', this.hoverFile);

      this.http.put(`${this.baseUrl}/api/products/update/${this.productId}`, formData).subscribe({
        next: (res: any) => {
          Swal.fire({ icon: 'success', title: 'Product Updated!', timer: 1500, showConfirmButton: false })
            .then(() => this.router.navigate(['/admin/showproduct']));
        },
        error: (err) => {
          Swal.fire({ icon: 'error', title: 'Update Failed', text: 'Failed to update product', confirmButtonColor: '#9B7B5E' });
        }
      });
    } else {
      Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please fill all required fields', confirmButtonColor: '#9B7B5E' });
    }
  }
}
