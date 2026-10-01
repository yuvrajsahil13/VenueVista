import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EVENT_CATEGORIES, EVENT_STATUSES, EventCategory, Venue, VenueEvent } from '../../core/models/models';
import { EventService, VenueService } from '../../core/services/api.services';
import { EventCard } from '../../shared/components/event-card';
import { LabelPipe } from '../../shared/pipes/label.pipe';

@Component({
  selector: 'app-event-list',
  imports: [EventCard, LabelPipe],
  templateUrl: './event-list.html',
})
export class EventList implements OnInit {
  private eventService = inject(EventService);
  private venueService = inject(VenueService);
  private route = inject(ActivatedRoute);

  protected categories = EVENT_CATEGORIES;
  protected statuses = EVENT_STATUSES;
  protected events = signal<VenueEvent[]>([]);
  protected venues = signal<Venue[]>([]);
  protected loaded = signal(false);

  protected search = signal('');
  protected category = signal<EventCategory | ''>('');
  protected status = signal('PUBLISHED');
  protected sort = signal<'date' | 'title'>('date');

  protected venueMap = computed(() => new Map(this.venues().map(v => [v.id!, v])));
  protected filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const list = this.events().filter(e => {
      const venue = this.venueMap().get(e.venueId);
      const text = `${e.title} ${e.description ?? ''} ${venue?.name ?? ''} ${venue?.city ?? ''}`.toLowerCase();
      return (!q || text.includes(q))
        && (!this.category() || e.category === this.category())
        && (!this.status() || e.status === this.status());
    });
    return this.sort() === 'title'
      ? list.sort((a, b) => a.title.localeCompare(b.title))
      : list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  ngOnInit() {
    const cat = this.route.snapshot.queryParamMap.get('category');
    if (cat) this.category.set(cat as EventCategory);
    forkJoin({ events: this.eventService.getAll(), venues: this.venueService.getAll() }).subscribe({
      next: ({ events, venues }) => { this.events.set(events); this.venues.set(venues); this.loaded.set(true); },
      error: () => this.loaded.set(true),
    });
  }

  reset() {
    this.search.set(''); this.category.set(''); this.status.set('PUBLISHED'); this.sort.set('date');
  }

  protected value(e: Event): string { return (e.target as HTMLInputElement).value; }
}
