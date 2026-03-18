import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf, SlicePipe } from '@angular/common';
import { UserService } from '../../../service/user-service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  imports: [NgIf, SlicePipe, RouterLink]
})
export class Profile implements OnInit {
  user: any = null;
  userId = sessionStorage.getItem('id');

  // fallback from sessionStorage in case API is slow
  name = sessionStorage.getItem('name');
  email = sessionStorage.getItem('email');

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.userId) { this.router.navigate(['/login']); return; }
    this.userService.getUser(this.userId).subscribe({
      next: (res: any) => {
        this.user = res;
        this.cdr.detectChanges();
      },
      error: () => {
        // still show page with sessionStorage data
        this.user = { username: this.name, email: this.email, mobileno: '-', createdAt: '' };
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
