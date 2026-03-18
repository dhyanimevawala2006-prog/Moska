import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../service/user-service';
import { MSwal as Swal } from '../service/swal-service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPassword {
  // step 1 = email, step 2 = otp + new password
  step = 1;
  loading = false;
  verificationId = '';
  email = '';
  maskedMobile = '';

  emailForm: FormGroup;
  resetForm: FormGroup;

  constructor(private fb: FormBuilder, private uService: UserService, private router: Router) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.resetForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatch });
  }

  passwordMatch(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  sendOtp() {
    this.emailForm.markAllAsTouched();
    if (!this.emailForm.valid) return;
    this.loading = true;
    this.email = this.emailForm.value.email;

    this.uService.forgotPasswordOtp({ email: this.email }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.verificationId = res.verificationId;
        const mob: string = res.mobileno || '';
        this.maskedMobile = mob.length >= 4
          ? '******' + mob.slice(-4)
          : '******';
        this.step = 2;
      },
      error: (err: any) => {
        this.loading = false;
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.message || 'Something went wrong', confirmButtonColor: '#9B7B5E' });
      }
    });
  }

  resetPassword() {
    this.resetForm.markAllAsTouched();
    if (!this.resetForm.valid) return;
    this.loading = true;

    const { otp, newPassword } = this.resetForm.value;
    this.uService.resetPassword({ email: this.email, verificationId: this.verificationId, otp, newPassword }).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({ icon: 'success', title: 'Password Reset!', text: 'You can now login with your new password.', timer: 2000, showConfirmButton: false })
          .then(() => this.router.navigate(['/login']));
      },
      error: (err: any) => {
        this.loading = false;
        Swal.fire({ icon: 'error', title: 'Failed', text: err.error?.message || 'Invalid OTP', confirmButtonColor: '#9B7B5E' });
      }
    });
  }
}
