import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer-inner">
        <div>
          <a routerLink="/" class="brand"><span class="brand-mark">EV</span> EventVista</a>
          <p class="muted">Event ticketing &amp; venue management platform.</p>
        </div>
        <div class="footer-links">
          <a routerLink="/events">Events</a>
          <a routerLink="/venues">Venues</a>
          <a routerLink="/my-bookings">My Bookings</a>
        </div>
        <p class="muted small">© {{ year }} EventVista · HCL Training Project (P_014)</p>
      </div>
    </footer>
  `,
})
export class Footer {
  year = new Date().getFullYear();
}
