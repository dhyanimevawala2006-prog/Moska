import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MSwal as Swal } from '../../service/swal-service';

const ADMIN_EMAIL    = 'dk@gmail.com';
const ADMIN_PASSWORD = '111222';
const RECOVERY_KEY   = 'ADMIN2025';   // secret recovery code

@Component({
  selector: 'app-admin-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './admin-forgot-password.html',
  styleUrls: ['./admin-forgot-password.css'],
})
export class AdminForgotPassword {
  step = 1;   // 1 = email, 2 = recovery key, 3 = success
  loading = false;
  showPass = false;

  emailForm: FormGroup;
  keyForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.keyForm = this.fb.group({
      recoveryKey: ['', Validators.required],
    });
  }

  verifyEmail() {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid) return;

    const email = this.emailForm.value.email.trim().toLowerCase();
    if (email !== ADMIN_EMAIL) {
      Swal.fire({ icon: 'error', title: 'Not Found', text: 'This email is not registered as admin.', confirmButtonColor: '#9B7B5E' });
      return;
    }
    this.step = 2;
  }

  verifyKey() {
    this.keyForm.markAllAsTouched();
    if (this.keyForm.invalid) return;

    const key = this.keyForm.value.recoveryKey.trim().toUpperCase();
    if (key !== RECOVERY_KEY) {
      Swal.fire({ icon: 'error', title: 'Invalid Key', text: 'Recovery key is incorrect.', confirmButtonColor: '#9B7B5E' });
      return;
    }
    this.step = 3;
  }

  goToLogin() {
    this.router.navigate(['/admin/login']);
  }

  get maskedPassword() {
    // show first 2 chars + stars + last char
    const p = ADMIN_PASSWORD;
    if (p.length <= 3) return p;
    return p[0] + p[1] + '*'.repeat(p.length - 3) + p[p.length - 1];
  }

  get fullPassword() {
    return ADMIN_PASSWORD;
  }

  togglePass() {
    this.showPass = !this.showPass;
  }
}
