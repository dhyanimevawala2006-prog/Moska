import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { MSwal as Swal } from '../../../service/swal-service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, NgIf, NgClass, NgFor],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  activeTab = 'profile';

  tabs = [
    { id: 'profile',      icon: 'fa-user-circle',     label: 'My Profile' },
    { id: 'security',     icon: 'fa-shield-alt',      label: 'Security' },
    { id: 'store',        icon: 'fa-store',            label: 'Store Settings' },
    { id: 'payment',      icon: 'fa-credit-card',      label: 'Payment' },
    { id: 'shipping',     icon: 'fa-truck',            label: 'Shipping' },
    { id: 'notification', icon: 'fa-bell',             label: 'Notifications' },
    { id: 'users',        icon: 'fa-users-cog',        label: 'User Management' },
  ];

  // Profile
  profile = {
    name:  sessionStorage.getItem('adminName')  || 'DK',
    email: sessionStorage.getItem('adminEmail') || 'admin@gmail.com',
  };

  // Security
  security = { currentPassword: '', newPassword: '', confirmPassword: '', twoFactor: false };

  // Store
  store = { siteName: 'eStore', contactEmail: 'support@estore.com', contactPhone: '', logoUrl: '' };

  // Payment
  payment = { gateway: 'razorpay', apiKey: '', currency: 'INR', testMode: true };

  // Shipping
  shipping = { freeAbove: 500, defaultCharge: 50, rules: [{ city: 'Mumbai', charge: 40 }, { city: 'Delhi', charge: 45 }] };
  newCity = ''; newCharge = 0;

  // Notifications
  notif = { orderAlert: true, newUser: true, paymentAlert: true, emailNotif: true };

  // Users
  users = [
    { name: 'DK', email: 'admin@gmail.com', role: 'Admin' },
  ];

  // Theme
  theme = { darkMode: false, language: 'en' };

  setTab(id: string) { this.activeTab = id; }

  saveProfile() {
    sessionStorage.setItem('adminName', this.profile.name);
    sessionStorage.setItem('adminEmail', this.profile.email);
    Swal.fire({ icon: 'success', title: 'Profile Updated!', timer: 1400, showConfirmButton: false });
  }

  savePassword() {
    if (!this.security.newPassword) return;
    if (this.security.newPassword !== this.security.confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Passwords do not match!' }); return;
    }
    Swal.fire({ icon: 'success', title: 'Password Changed!', timer: 1400, showConfirmButton: false });
    this.security = { currentPassword: '', newPassword: '', confirmPassword: '', twoFactor: this.security.twoFactor };
  }

  saveStore() {
    Swal.fire({ icon: 'success', title: 'Store Settings Saved!', timer: 1400, showConfirmButton: false });
  }

  savePayment() {
    Swal.fire({ icon: 'success', title: 'Payment Settings Saved!', timer: 1400, showConfirmButton: false });
  }

  addShippingRule() {
    if (!this.newCity) return;
    this.shipping.rules.push({ city: this.newCity, charge: this.newCharge });
    this.newCity = ''; this.newCharge = 0;
  }

  removeRule(i: number) { this.shipping.rules.splice(i, 1); }

  saveShipping() {
    Swal.fire({ icon: 'success', title: 'Shipping Settings Saved!', timer: 1400, showConfirmButton: false });
  }

  saveNotif() {
    Swal.fire({ icon: 'success', title: 'Notification Settings Saved!', timer: 1400, showConfirmButton: false });
  }

  toggleTheme() {
    document.body.classList.toggle('dark-mode', this.theme.darkMode);
  }
}
