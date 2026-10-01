import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { toDataURL } from 'qrcode';
import { Booking, Payment, Ticket, Venue, VenueEvent } from '../../core/models/models';
import { BookingService, EventService, PaymentService, TicketService, VenueService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LabelPipe } from '../../shared/pipes/label.pipe';

/** Printable e-ticket with a QR code that gate staff can scan. */
@Component({
  selector: 'app-e-ticket',
  imports: [RouterLink, DatePipe, CurrencyPipe, LabelPipe],
  templateUrl: './e-ticket.html',
})
export class ETicket implements OnInit {
  bookingId = input.required<string>();

  private bookingService = inject(BookingService);
  private eventService = inject(EventService);
  private venueService = inject(VenueService);
  private ticketService = inject(TicketService);
  private paymentService = inject(PaymentService);
  private router = inject(Router);
  private toast = inject(ToastService);
  protected auth = inject(AuthService);

  protected booking = signal<Booking | null>(null);
  protected event = signal<VenueEvent | null>(null);
  protected venue = signal<Venue | null>(null);
  protected ticket = signal<Ticket | null>(null);
  protected payment = signal<Payment | null>(null);
  protected qr = signal('');

  ngOnInit() {
    const id = Number(this.bookingId());
    forkJoin({ booking: this.bookingService.getById(id), payments: this.paymentService.getAll() }).subscribe({
      next: ({ booking, payments }) => {
        if (booking.userId !== this.auth.user()?.id && !this.auth.isAdmin()) {
          this.toast.error('This ticket does not belong to you');
          this.router.navigate(['/my-bookings']);
          return;
        }
        const payment = payments.find(p => p.bookingId === id) ?? null;
        if (!payment || booking.status === 'CANCELLED') {
          this.toast.info(booking.status === 'CANCELLED' ? 'This booking was cancelled' : 'Complete the payment to get your e-ticket');
          this.router.navigate(booking.status === 'CANCELLED' ? ['/my-bookings'] : ['/checkout', id]);
          return;
        }
        this.booking.set(booking);
        this.payment.set(payment);
        forkJoin({
          event: this.eventService.getById(booking.eventId),
          tickets: this.ticketService.getByEvent(booking.eventId),
        }).subscribe(({ event, tickets }) => {
          this.event.set(event);
          this.ticket.set(tickets.find(t => t.id === booking.ticketId) ?? null);
          this.venueService.getById(event.venueId).subscribe(v => this.venue.set(v));
          this.makeQr(booking, event, payment);
        });
      },
      error: () => this.router.navigate(['/my-bookings']),
    });
  }

  private makeQr(b: Booking, e: VenueEvent, p: Payment) {
    const data = JSON.stringify({
      app: 'EventVista', ref: b.bookingReference, event: e.title, eventId: e.id,
      qty: b.quantity, seats: b.seatNumbers ?? 'GA', txn: p.transactionId,
    });
    toDataURL(data, { width: 240, margin: 1, color: { dark: '#1e1b4b', light: '#ffffff' } })
      .then(url => this.qr.set(url))
      .catch(() => this.toast.error('Could not generate QR code'));
  }

  print() { window.print(); }

  download() {
    const a = document.createElement('a');
    a.href = this.qr();
    a.download = `${this.booking()?.bookingReference ?? 'ticket'}-qr.png`;
    a.click();
  }
}
