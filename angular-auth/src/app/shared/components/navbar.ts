import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LabelPipe } from '../pipes/label.pipe';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, LabelPipe],
  templateUrl: './navbar.html',
})
export class Navbar {
  protected auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  protected menuOpen = signal(false);

  logout() {
    this.auth.logout();
    this.menuOpen.set(false);
    this.toast.info('You have been logged out');
    this.router.navigate(['/']);
  }
}
