import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../service/user-service';
import { MSwal as Swal } from '../service/swal-service';

@Component({
  selector: 'app-otp',
  imports: [FormsModule],
  templateUrl: './otp.html',
  styleUrl: './otp.css',
})
export class Otp {
  otp: any = '';

  constructor(private userService: UserService) {}

  // move cursor forward
  moveNext(event: any, next: any) {
    if (event.target.value.length === 1) {
      next.focus();
    }
  }

  // move cursor backward
  movePrev(event: any, prev: any) {
    if (event.key === 'Backspace' && event.target.value === '') {
      prev.focus();
    }
  }

  // combine otp boxes
  submitOtp(code: string) {
    this.otp = code;
    this.verifyOtp();
  }

  verifyOtp() {
    const data = {
      otp: this.otp,
      verificationId: sessionStorage.getItem('verificationId'),
      userData: JSON.parse(sessionStorage.getItem('userData')!),
    };

    this.userService.verifyOtp(data).subscribe({
      next: (res: any) => {
        sessionStorage.removeItem('verificationId');
        sessionStorage.removeItem('userData');
        Swal.fire({ icon: 'success', title: 'Registered!', text: res.message || 'Account created successfully', timer: 1800, showConfirmButton: false })
          .then(() => window.location.href = '/');
      },
      error: (err: any) => {
        Swal.fire({ icon: 'error', title: 'Invalid OTP', text: err.error?.message || 'Please try again', confirmButtonColor: '#9B7B5E' });
      },
    });
  }
}