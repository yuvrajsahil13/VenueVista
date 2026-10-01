import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Review, User, Venue, VenueEvent } from '../../core/models/models';
import { EventService, ReviewService, UserService, VenueService } from '../../core/services/api.services';
import { EventCard } from '../../shared/components/event-card';

@Component({
  selector: 'app-venue-detail',
  imports: [RouterLink, EventCard],
  templateUrl: './venue-detail.html',
})
export class VenueDetail implements OnInit {
  id = input.required<string>();

  private venueService = inject(VenueService);
  private eventService = inject(EventService);
  private reviewService = inject(ReviewService);
  private userService = inject(UserService);

  protected venue = signal<Venue | null>(null);
  protected events = signal<VenueEvent[]>([]);
  protected reviews = signal<Review[]>([]);
  protected users = signal(new Map<number, User>());
  protected notFound = signal(false);
  protected avg = computed(() => {
    const r = this.reviews();
    return r.length ? r.reduce((s, x) => s + x.rating, 0) / r.length : 0;
  });

  ngOnInit() {
    const id = Number(this.id());
    this.venueService.getById(id).subscribe({ next: v => this.venue.set(v), error: () => this.notFound.set(true) });
    forkJoin({
      events: this.eventService.getAll(),
      reviews: this.reviewService.getByVenue(id),
      users: this.userService.getAll(),
    }).subscribe(({ events, reviews, users }) => {
      this.events.set(events.filter(e => e.venueId === id).sort((a, b) => a.startTime.localeCompare(b.startTime)));
      this.reviews.set(reviews);
      this.users.set(new Map(users.map(u => [u.id!, u])));
    });
  }

  stars(n: number) { return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n)); }
}
