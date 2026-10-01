import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EVENT_CATEGORIES, Venue, VenueEvent } from '../../core/models/models';
import { EventService, VenueService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { EventCard } from '../../shared/components/event-card';
import { LabelPipe } from '../../shared/pipes/label.pipe';

@Component({
  selector: 'app-home',
  imports: [RouterLink, EventCard, LabelPipe],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private eventService = inject(EventService);
  private venueService = inject(VenueService);
  protected auth = inject(AuthService);

  protected events = signal<VenueEvent[]>([]);
  protected venues = signal<Venue[]>([]);
  protected loaded = signal(false);
  protected categories = EVENT_CATEGORIES;

  protected venueMap = computed(() => new Map(this.venues().map(v => [v.id!, v])));
  protected cities = computed(() => new Set(this.venues().map(v => v.city.toLowerCase())).size);
  protected featured = computed(() => {
    const now = Date.now();
    const published = this.events().filter(e => e.status === 'PUBLISHED');
    const upcoming = published.filter(e => new Date(e.startTime).getTime() >= now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return (upcoming.length ? upcoming : published).slice(0, 6);
  });

  ngOnInit() {
    forkJoin({ events: this.eventService.getAll(), venues: this.venueService.getAll() }).subscribe({
      next: ({ events, venues }) => { this.events.set(events); this.venues.set(venues); this.loaded.set(true); },
      error: () => this.loaded.set(true),
    });
  }
}
