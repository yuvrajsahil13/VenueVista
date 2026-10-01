import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, LowerCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Review, Seat, Ticket, User, Venue, VenueEvent } from '../../core/models/models';
import {
  BookingService, EventService, ReviewService, SeatService, TicketService, UserService, VenueService,
} from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LabelPipe } from '../../shared/pipes/label.pipe';
import { SeatMap } from '../../shared/components/seat-map';

@Component({
  selector: 'app-event-detail',
  imports: [RouterLink, DatePipe, CurrencyPipe, LowerCasePipe, ReactiveFormsModule, LabelPipe, SeatMap],
  templateUrl: './event-detail.html',
})
export class EventDetail implements OnInit {
  /** Bound from the :id route parameter */
  id = input.required<string>();

  private events = inject(EventService);
  private venues = inject(VenueService);
  private tickets = inject(TicketService);
  private reviews = inject(ReviewService);
  private users = inject(UserService);
  private bookings = inject(BookingService);
  private seatService = inject(SeatService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  protected auth = inject(AuthService);

  protected event = signal<VenueEvent | null>(null);
  protected venue = signal<Venue | null>(null);
  protected ticketList = signal<Ticket[]>([]);
  protected reviewList = signal<Review[]>([]);
  protected userMap = signal(new Map<number, User>());
  protected notFound = signal(false);
  protected submitting = signal(false);

  // Seat selection
  protected seats = signal<Seat[]>([]);
  protected reservedSeats = signal<string[]>([]);
  protected selectedSeats = signal<string[]>([]);
  protected seatMode = computed(() => this.seats().length > 0);
  protected maxSeats = computed(() => Math.min(10, this.selectedTicket()?.availableQuantity ?? 10));

  protected bookingForm = this.fb.nonNullable.group({
    ticketId: [0, [Validators.required, Validators.min(1)]],
    quantity: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
  });
  protected reviewForm = this.fb.nonNullable.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
  });

  private selectedTicketId = signal(0);
  private selectedQty = signal(1);
  protected selectedTicket = computed(() => this.ticketList().find(t => t.id === this.selectedTicketId()));
  protected effectiveQty = computed(() => this.seatMode() ? this.selectedSeats().length : this.selectedQty());
  protected total = computed(() => (this.selectedTicket()?.price ?? 0) * this.effectiveQty());
  protected avgRating = computed(() => {
    const r = this.reviewList();
    return r.length ? r.reduce((s, x) => s + x.rating, 0) / r.length : 0;
  });
  protected bookable = computed(() => this.event()?.status === 'PUBLISHED');

  ngOnInit() {
    const id = Number(this.id());
    this.bookingForm.controls.ticketId.valueChanges.subscribe(v => this.selectedTicketId.set(Number(v)));
    this.bookingForm.controls.quantity.valueChanges.subscribe(v => this.selectedQty.set(Number(v) || 0));

    this.events.getById(id).subscribe({
      next: event => {
        this.event.set(event);
        this.venues.getById(event.venueId).subscribe(v => this.venue.set(v));
        this.seatService.getByVenue(event.venueId).subscribe(s => this.seats.set(s));
        this.loadReservedSeats(event.id!);
      },
      error: () => this.notFound.set(true),
    });
    this.tickets.getByEvent(id).subscribe(list => {
      this.ticketList.set(list);
      const first = list.find(t => t.availableQuantity > 0);
      if (first) this.bookingForm.controls.ticketId.setValue(first.id!);
    });
    this.loadReviews(id);
  }

  private loadReservedSeats(eventId: number) {
    this.bookings.reservedSeats(eventId).subscribe(r => {
      this.reservedSeats.set(r);
      this.selectedSeats.update(sel => sel.filter(s => !r.includes(s)));
    });
  }

  private loadReviews(eventId: number) {
    forkJoin({ reviews: this.reviews.getByEvent(eventId), users: this.users.getAll() }).subscribe(({ reviews, users }) => {
      this.reviewList.set(reviews.reverse());
      this.userMap.set(new Map(users.map(u => [u.id!, u])));
    });
  }

  book() {
    const user = this.auth.user();
    if (!user) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (this.bookingForm.controls.ticketId.invalid) { this.bookingForm.markAllAsTouched(); return; }
    if (!this.seatMode() && this.bookingForm.invalid) { this.bookingForm.markAllAsTouched(); return; }
    if (this.seatMode() && this.selectedSeats().length === 0) {
      this.toast.error('Please pick your seats on the seat map');
      return;
    }
    const { ticketId } = this.bookingForm.getRawValue();
    const quantity = this.effectiveQty();
    const ticket = this.selectedTicket();
    if (ticket && quantity > ticket.availableQuantity) {
      this.toast.error(`Only ${ticket.availableQuantity} ticket(s) left for this tier`);
      return;
    }
    this.submitting.set(true);
    this.bookings.create({
      userId: user.id!, eventId: this.event()!.id!, ticketId: Number(ticketId), quantity,
      seatNumbers: this.seatMode() ? this.selectedSeats() : undefined,
    }).subscribe({
      next: booking => {
        this.toast.success(`Booking ${booking.bookingReference} created — complete your payment`);
        this.router.navigate(['/checkout', booking.id]);
      },
      error: () => {
        this.submitting.set(false);
        this.loadReservedSeats(this.event()!.id!);
      },
    });
  }

  submitReview() {
    const user = this.auth.user();
    if (!user || this.reviewForm.invalid) { this.reviewForm.markAllAsTouched(); return; }
    const ev = this.event()!;
    this.reviews.create({ ...this.reviewForm.getRawValue(), userId: user.id!, eventId: ev.id, venueId: ev.venueId })
      .subscribe(() => {
        this.toast.success('Thanks for your review!');
        this.reviewForm.reset({ rating: 5, comment: '' });
        this.loadReviews(ev.id!);
      });
  }

  stars(n: number) { return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n)); }
}
