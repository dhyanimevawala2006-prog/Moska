import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MSwal as Swal } from '../service/swal-service';

import { UserService } from '../service/user-service';
import { CustomValidators } from '../validators/custom-validators';
import { ValidationMessage } from '../validation-message/validation-message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, ValidationMessage],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  frmGrp: FormGroup;

  constructor(private fb: FormBuilder, private u_service: UserService, private router: Router) {
    this.frmGrp = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, CustomValidators.exactlySixCharacters()]]
    });
  }

  onsubmit() {
    this.frmGrp.markAllAsTouched();
    
    if (this.frmGrp.valid) {
      this.u_service.login(this.frmGrp.value).subscribe({
        next: (res: any) => {
          sessionStorage.setItem("id", res.user.id);
          sessionStorage.setItem("name", res.user.name);
          sessionStorage.setItem("email", res.user.email);
          Swal.fire({ icon: 'success', title: 'Welcome back!', text: res.message, timer: 1500, showConfirmButton: false })
            .then(() => window.location.href = "/");
        },
        error: (err: any) => {
          Swal.fire({ icon: 'error', title: 'Login Failed', text: err.error?.message || 'Invalid credentials', confirmButtonColor: '#9B7B5E' });
        }
      });
    }
  }
}




