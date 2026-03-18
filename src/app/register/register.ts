import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MSwal as Swal } from '../service/swal-service';

import { UserService } from '../service/user-service';
import { CustomValidators } from '../validators/custom-validators';
import { ValidationMessage } from '../validation-message/validation-message';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule,ValidationMessage],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  frmGrp!: FormGroup;
  
  constructor(private fb: FormBuilder, private uService: UserService) {
    this.frmGrp = this.fb.group({
      username: ['', [Validators.required, CustomValidators.noDigits()]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, CustomValidators.exactlySixCharacters()]],
      mobileno: ['', [Validators.required, CustomValidators.exactlyTenDigits()]]
    });
  }
  
 onsubmit() {
    this.frmGrp.markAllAsTouched();

    if (this.frmGrp.valid) {
      this.uService.sendOtp(this.frmGrp.value).subscribe({
        next: (res: any) => {
          sessionStorage.setItem('verificationId', res.verificationId);
          sessionStorage.setItem('userData', JSON.stringify(this.frmGrp.value));
          Swal.fire({ icon: 'success', title: 'OTP Sent!', text: 'Check your mobile for the OTP.', timer: 2000, showConfirmButton: false })
            .then(() => window.location.href = '/otp');
        },
        error: (err: any) => {
          Swal.fire({ icon: 'error', title: 'Failed', text: err.error?.message || 'Could not send OTP', confirmButtonColor: '#9B7B5E' });
        },
      });
    }
  }
}
