import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Venue, VenueEvent } from '../../core/models/models';
import { LabelPipe } from '../pipes/label.pipe';

@Component({
  selector: 'app-event-card',
  imports: [RouterLink, DatePipe, LabelPipe],
  template: `
    <a class="card card-link event-card" [routerLink]="['/events', event().id]">
      <div class="card-media cat-{{ event().category.toLowerCase() }}"
           [style.background-image]="event().bannerUrl ? 'url(' + event().bannerUrl + ')' : null">
        @if (!event().bannerUrl) { <span class="media-label">{{ event().category | label }}</span> }
        <span class="badge badge-{{ event().status.toLowerCase() }} media-badge">{{ event().status | label }}</span>
      </div>
      <div class="card-body">
        <span class="eyebrow">{{ event().category | label }}</span>
        <h3>{{ event().title }}</h3>
        <p class="meta">📅 {{ event().startTime | date: 'EEE, d MMM y · h:mm a' }}</p>
        @if (venue(); as v) { <p class="meta">📍 {{ v.name }}, {{ v.city }}</p> }
      </div>
    </a>
  `,
})
export class EventCard {
  event = input.required<VenueEvent>();
  venue = input<Venue | undefined>();
}
