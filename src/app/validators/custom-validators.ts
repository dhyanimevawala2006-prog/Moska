import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  // Name field - no digits allowed
  static noDigits(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const hasDigit = /\d/.test(control.value);
      return hasDigit ? { noDigits: true } : null;
    };
  }

  // Phone number - exactly 10 digits only
  static exactlyTenDigits(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isValid = /^\d{10}$/.test(control.value);
      return !isValid ? { exactlyTenDigits: true } : null;
    };
  }

  // Password - exactly 6 digits only
  static exactlySixCharacters(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const isValid = /^\d{6}$/.test(control.value);
      return !isValid ? { exactlySixCharacters: true } : null;
    };
  }
}
