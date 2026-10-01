import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { Booking, EVENT_CATEGORIES, Payment, User, Venue, VenueEvent } from '../../core/models/models';
import { BookingService, EventService, PaymentService, UserService, VenueService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { LabelPipe } from '../../shared/pipes/label.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, LabelPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  protected auth = inject(AuthService);
  private eventService = inject(EventService);
  private venueService = inject(VenueService);
  private bookingService = inject(BookingService);
  private paymentService = inject(PaymentService);
  private userService = inject(UserService);

  protected events = signal<VenueEvent[]>([]);
  protected venues = signal<Venue[]>([]);
  protected bookings = signal<Booking[]>([]);
  protected payments = signal<Payment[]>([]);
  protected users = signal<User[]>([]);
  protected now = new Date();

  protected eventMap = computed(() => new Map(this.events().map(e => [e.id!, e])));
  protected userMap = computed(() => new Map(this.users().map(u => [u.id!, u])));
  protected revenue = computed(() => this.payments().reduce((s, p) => s + (p.amount ?? 0), 0));
  protected activeBookings = computed(() => this.bookings().filter(b => b.status !== 'CANCELLED').length);
  protected ticketsSold = computed(() => this.bookings().filter(b => b.status !== 'CANCELLED').reduce((s, b) => s + b.quantity, 0));
  protected recent = computed(() => [...this.bookings()].sort((a, b) => b.bookingTime.localeCompare(a.bookingTime)).slice(0, 6));
  protected byCategory = computed(() => {
    const total = this.events().length || 1;
    return EVENT_CATEGORIES.map(c => {
      const count = this.events().filter(e => e.category === c).length;
      return { category: c, count, pct: Math.round((count / total) * 100) };
    }).filter(x => x.count > 0);
  });

  ngOnInit() {
    const admin = this.auth.isAdmin();
    forkJoin({
      events: this.eventService.getAll(),
      venues: this.venueService.getAll(),
      bookings: admin ? this.bookingService.getAll() : of([] as Booking[]),
      payments: admin ? this.paymentService.getAll() : of([] as Payment[]),
      users: admin ? this.userService.getAll() : of([] as User[]),
    }).subscribe(d => {
      const mine = admin ? d.events : d.events.filter(e => e.organizerId === this.auth.user()?.id);
      this.events.set(mine);
      this.venues.set(d.venues);
      this.bookings.set(d.bookings);
      this.payments.set(d.payments);
      this.users.set(d.users);
    });
  }
}
