import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CouponService } from '../../service/coupon-service';
import { MSwal as Swal } from '../../service/swal-service';

@Component({
  selector: 'app-add-coupon',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-coupon.html',
  styleUrls: ['./add-coupon.css'],
})
export class AddCouponComponent {
  couponForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private couponService: CouponService,
  ) {
    this.couponForm = this.fb.group({
      code: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      discountType: ['percentage'],
      discountValue: ['', Validators.required],
      minOrderAmount: [0],
      maxDiscount: [0],
      expireDate: ['', Validators.required],
      isActive: [true],
      popular: [false],
    });
  }

  submitCoupon() {
    if (this.couponForm.invalid) {
      Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please fill all required fields.', confirmButtonColor: '#9B7B5E' });
      return;
    }
    this.loading = true;
    this.couponService.createCoupon(this.couponForm.value).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({ icon: 'success', title: 'Coupon Created!', timer: 1800, showConfirmButton: false });
        this.couponForm.reset({ discountType: 'percentage', isActive: true, popular: false });
      },
      error: (err: any) => {
        this.loading = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message || 'Something went wrong', confirmButtonColor: '#9B7B5E' });
      },
    });
  }
}
