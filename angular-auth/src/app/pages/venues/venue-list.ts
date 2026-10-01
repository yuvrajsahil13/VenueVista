import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Venue } from '../../core/models/models';
import { VenueService } from '../../core/services/api.services';

@Component({
  selector: 'app-venue-list',
  imports: [RouterLink],
  templateUrl: './venue-list.html',
})
export class VenueList implements OnInit {
  private venueService = inject(VenueService);
  protected venues = signal<Venue[]>([]);
  protected loaded = signal(false);
  protected city = signal('');

  ngOnInit() { this.load(); }

  /** Uses the backend endpoint GET /api/venues/search?city= when a city is entered. */
  load() {
    this.loaded.set(false);
    const city = this.city().trim();
    const request = city ? this.venueService.searchByCity(city) : this.venueService.getAll();
    request.subscribe({
      next: v => { this.venues.set(v); this.loaded.set(true); },
      error: () => this.loaded.set(true),
    });
  }

  clear() { this.city.set(''); this.load(); }

  protected value(e: Event): string { return (e.target as HTMLInputElement).value; }
}
