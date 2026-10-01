import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-shell container">
      <aside class="admin-nav card">
        <p class="eyebrow">{{ auth.isAdmin() ? 'Admin' : 'Organizer' }} panel</p>
        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">📊 Dashboard</a>
        <a routerLink="/admin/events" routerLinkActive="active">🎫 Events &amp; Tickets</a>
        <a routerLink="/admin/venues" routerLinkActive="active">🏛️ Venues</a>
        @if (auth.isAdmin()) {
          <a routerLink="/admin/bookings" routerLinkActive="active">🧾 Bookings</a>
          <a routerLink="/admin/users" routerLinkActive="active">👥 Users</a>
        }
      </aside>
      <section class="admin-content"><router-outlet /></section>
    </div>
  `,
})
export class AdminLayout {
  protected auth = inject(AuthService);
}
