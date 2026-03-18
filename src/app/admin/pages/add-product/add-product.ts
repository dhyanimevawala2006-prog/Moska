import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../service/product-service';
import { CategoryService } from '../../../service/category-service';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { MSwal as Swal } from '../../../service/swal-service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.html',
  styleUrls: ['./add-product.css'],
  imports: [ReactiveFormsModule, NgIf, NgFor, RouterLink]
})
export class AddProduct implements OnInit {

  productForm!: FormGroup;
  categories: any[] = [];
  mainFile!: File;
  hoverFile!: File;
  mainFileName: string = '';
  hoverFileName: string = '';
  colorList: { color: string; image: File | null; preview: string }[] = [
    { color: '#000000', image: null, preview: '' }
  ];

  availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  selectedSizes: string[] = [];

  get isClothesCategory(): boolean {
    const cat = this.productForm.get('category')?.value;
    return cat?.toLowerCase() === 'clothes';
  }

  toggleSize(size: string) {
    const idx = this.selectedSizes.indexOf(size);
    if (idx > -1) this.selectedSizes.splice(idx, 1);
    else this.selectedSizes.push(size);
  }

  isSizeSelected(size: string): boolean {
    return this.selectedSizes.includes(size);
  }

  constructor(
    private fb: FormBuilder,
    private pservice: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      pname: ['', Validators.required],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      oldPrice: [''],
      stock: [0, [Validators.min(0)]],
      description: ['', Validators.required],
      pic: [''],
      picHover: ['']
    });
  }

  ngOnInit() {
    this.categoryService.get().subscribe({
      next: (res: any) => { this.categories = res?.length > 0 ? res : this.defaultCategories(); },
      error: () => { this.categories = this.defaultCategories(); }
    });
  }

  defaultCategories() {
    return [
      { cat_name: 'Clothes' }, { cat_name: 'Beauty' }, { cat_name: 'Medicine' },
      { cat_name: 'Electronic Item' }, { cat_name: 'Toy' }, { cat_name: 'Jewellery' }
    ];
  }

  onMainFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.mainFile = event.target.files[0];
      this.mainFileName = this.mainFile.name;
    }
  }

  onHoverFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.hoverFile = event.target.files[0];
      this.hoverFileName = this.hoverFile.name;
    }
  }

  addColor() {
    this.colorList.push({ color: '#000000', image: null, preview: '' });
  }

  removeColor(index: number) {
    if (this.colorList.length > 1) this.colorList.splice(index, 1);
  }

  updateColor(index: number, value: string) {
    this.colorList[index].color = value;
  }

  onColorImageChange(index: number, event: any) {
    const file = event.target.files[0];
    if (file) {
      this.colorList[index].image = file;
      const reader = new FileReader();
      reader.onload = () => { this.colorList[index].preview = reader.result as string; };
      reader.readAsDataURL(file);
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
      if (this.productForm.value.oldPrice) formData.append('oldPrice', this.productForm.value.oldPrice);

      this.colorList.forEach(c => {
        formData.append('colors[]', c.color);
        if (c.image) formData.append('colorImages', c.image);
      });

      if (this.isClothesCategory && this.selectedSizes.length > 0) {
        this.selectedSizes.forEach(s => formData.append('sizes[]', s));
      }

      if (this.mainFile) formData.append('pic', this.mainFile);
      if (this.hoverFile) formData.append('picHover', this.hoverFile);

      this.pservice.addProduct(formData).subscribe({
        next: (res: any) => {
          Swal.fire({ icon: 'success', title: 'Product Added!', text: res.message || 'Product added successfully', timer: 1800, showConfirmButton: false });
          this.productForm.reset();
          this.mainFileName = '';
          this.hoverFileName = '';
          this.colorList = [{ color: '#000000', image: null, preview: '' }];
          this.selectedSizes = [];
        },
        error: (err) => {
          Swal.fire({ icon: 'error', title: 'Failed', text: 'Failed to add product: ' + (err.error?.message || err.message), confirmButtonColor: '#9B7B5E' });
        }
      });
    } else {
      Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please fill all required fields', confirmButtonColor: '#9B7B5E' });
    }
  }
}
