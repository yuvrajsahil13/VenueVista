import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Booking, Payment, Ticket, VenueEvent } from '../../core/models/models';
import { BookingService, EventService, PaymentService, TicketService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LabelPipe } from '../../shared/pipes/label.pipe';

@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink, DatePipe, CurrencyPipe, LabelPipe],
  templateUrl: './my-bookings.html',
})
export class MyBookings implements OnInit {
  private auth = inject(AuthService);
  private bookingService = inject(BookingService);
  private eventService = inject(EventService);
  private ticketService = inject(TicketService);
  private paymentService = inject(PaymentService);
  private toast = inject(ToastService);

  protected bookings = signal<Booking[]>([]);
  protected events = signal(new Map<number, VenueEvent>());
  protected tickets = signal(new Map<number, Ticket>());
  protected payments = signal(new Map<number, Payment>());
  protected loaded = signal(false);
  protected tab = signal<'ALL' | 'CONFIRMED' | 'CANCELLED'>('ALL');

  protected visible = computed(() => this.tab() === 'ALL'
    ? this.bookings()
    : this.bookings().filter(b => b.status === this.tab()));
  protected totalSpent = computed(() => this.bookings()
    .filter(b => b.status !== 'CANCELLED' && this.payments().has(b.id))
    .reduce((s, b) => s + b.totalPrice, 0));

  ngOnInit() { this.load(); }

  load() {
    forkJoin({
      bookings: this.bookingService.getByUser(this.auth.user()!.id!),
      events: this.eventService.getAll(),
      tickets: this.ticketService.getAll(),
      payments: this.paymentService.getAll(),
    }).subscribe({
      next: ({ bookings, events, tickets, payments }) => {
        this.bookings.set(bookings.sort((a, b) => b.bookingTime.localeCompare(a.bookingTime)));
        this.events.set(new Map(events.map(e => [e.id!, e])));
        this.tickets.set(new Map(tickets.map(t => [t.id!, t])));
        this.payments.set(new Map(payments.map(p => [p.bookingId, p])));
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });
  }

  cancel(b: Booking) {
    if (!confirm(`Cancel booking ${b.bookingReference}? Your tickets will be released.`)) return;
    this.bookingService.cancel(b.id).subscribe(() => {
      this.toast.success('Booking cancelled');
      this.load();
    });
  }
}
