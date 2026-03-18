import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CouponService } from '../../service/coupon-service';
import { MSwal as Swal } from '../../service/swal-service';

@Component({
  selector: 'app-edit-coupon',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-coupon.html',
  styleUrl: './edit-coupon.css',
})
export class EditCouponComponent implements OnInit {
  couponForm!: FormGroup;
  couponId!: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private couponService: CouponService,
    public router: Router,
  ) {}

  ngOnInit() {
    this.couponId = this.route.snapshot.paramMap.get('id') || '';

    this.couponForm = this.fb.group({
      code: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      discountType: ['percentage'],
      discountValue: ['', Validators.required],
      minOrderAmount: [''],
      maxDiscount: [''],
      expireDate: ['', Validators.required],
      isActive: [true],
      popular: [false],
    });

    this.loadCoupon();
  }

  loadCoupon() {
    this.couponService.getCoupons().subscribe((res: any) => {
      const coupon = res.data.find((c: any) => c._id === this.couponId);

      if (coupon) {
        this.couponForm.patchValue(coupon);
      }
    });
  }

  updateCoupon() {
    if (this.couponForm.valid) {
      this.couponService.updateCoupon(this.couponId, this.couponForm.value).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Coupon Updated!', timer: 1500, showConfirmButton: false })
            .then(() => this.router.navigate(['/admin/coupons']));
        },
        error: (err) => {
          Swal.fire({ icon: 'error', title: 'Update Failed', text: err.error?.message || 'Update failed', confirmButtonColor: '#9B7B5E' });
        },
      });
    }
  }
}
