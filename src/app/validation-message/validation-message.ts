import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  imports: [NgIf],
 template: `
    <div class="validation-errors" *ngIf="control?.invalid && (control?.dirty || control?.touched)">
      <div class="error-message" *ngIf="control?.errors?.['required']">
        This field is required.
      </div>
      <div class="error-message" *ngIf="control?.errors?.['email']">
        Please enter a valid email address.
      </div>
      <div class="error-message" *ngIf="control?.errors?.['noDigits']">
        Digits are not allowed in name.
      </div>
      <div class="error-message" *ngIf="control?.errors?.['exactlyTenDigits']">
        Phone number must be exactly 10 digits.
      </div>
      <div class="error-message" *ngIf="control?.errors?.['exactlySixCharacters']">
        Password must be exactly 6 digits only.
      </div>
      <div class="error-message" *ngIf="control?.errors?.['minlength'] as minLengthError">
        Minimum {{ minLengthError.requiredLength }} characters required.
      </div>
      <div class="error-message" *ngIf="control?.errors?.['maxlength'] as maxLengthError">
        Maximum {{ maxLengthError.requiredLength }} characters allowed.
      </div>
    </div>
  `,
  styleUrl: './validation-message.css',
})
export class ValidationMessage {
  @Input() control: AbstractControl | null = null;
}