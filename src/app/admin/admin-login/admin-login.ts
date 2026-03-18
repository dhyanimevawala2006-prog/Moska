import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { MSwal as Swal } from '../../service/swal-service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css'],
})
export class AdminLogin {
  frmGrp: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private router: Router) {
    if (sessionStorage.getItem('adminId')) {
      this.router.navigate(['/admin/dashboard']);
    }
    this.frmGrp = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onsubmit() {
    this.frmGrp.markAllAsTouched();
    if (this.frmGrp.invalid) return;

    const { email, password } = this.frmGrp.value;

    if (email === 'dk@gmail.com' && password === '111222') {
      sessionStorage.setItem('adminId',    'master-admin');
      sessionStorage.setItem('adminName',  'DK');
      sessionStorage.setItem('adminEmail', email);
      Swal.fire({ icon: 'success', title: 'Welcome, Admin!', timer: 1400, showConfirmButton: false })
        .then(() => this.router.navigate(['/admin/dashboard']));
    } else {
      Swal.fire({ icon: 'error', title: 'Login Failed', text: 'Invalid email or password', confirmButtonColor: '#9B7B5E' });
    }
  }
}
