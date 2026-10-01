import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Booking, Payment, User, VenueEvent } from '../../core/models/models';
import { BookingService, EventService, PaymentService, UserService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';
import { LabelPipe } from '../../shared/pipes/label.pipe';

@Component({
  selector: 'app-manage-bookings',
  imports: [CurrencyPipe, DatePipe, LabelPipe],
  template: `
    <div class="admin-head"><h1>Bookings</h1><p class="muted">{{ filtered().length }} of {{ bookings().length }} booking(s)</p></div>
    <div class="card">
      <div class="table-toolbar">
        <input class="input" type="search" placeholder="Search ref, user or event…" (input)="search.set($any($event.target).value)" />
        <select class="input" (change)="status.set($any($event.target).value)">
          <option value="">All statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Ref</th><th>User</th><th>Event</th><th>Qty</th><th>Seats</th><th>Total</th><th>Booked</th><th>Status</th><th>Payment</th><th></th></tr></thead>
          <tbody>
            @for (b of filtered(); track b.id) {
              <tr>
                <td class="mono">{{ b.bookingReference }}</td>
                <td>{{ users().get(b.userId)?.name ?? '#' + b.userId }}</td>
                <td>{{ events().get(b.eventId)?.title ?? '#' + b.eventId }}</td>
                <td>{{ b.quantity }}</td>
                <td class="small">{{ b.seatNumbers || '—' }}</td>
                <td>{{ b.totalPrice | currency: 'INR' }}</td>
                <td class="small">{{ b.bookingTime | date: 'd MMM, h:mm a' }}</td>
                <td><span class="badge badge-{{ b.status.toLowerCase() }}">{{ b.status | label }}</span></td>
                <td>
                  @if (payments().get(b.id); as p) { <span class="badge badge-paid">{{ p.paymentMethod | label }}</span> }
                  @else { <span class="muted small">Unpaid</span> }
                </td>
                <td class="actions-cell">
                  @if (b.status !== 'CANCELLED') { <button class="btn btn-danger-ghost btn-sm" (click)="cancel(b)">Cancel</button> }
                </td>
              </tr>
            } @empty { <tr><td colspan="10" class="muted">No bookings found.</td></tr> }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ManageBookings implements OnInit {
  private bookingService = inject(BookingService);
  private eventService = inject(EventService);
  private userService = inject(UserService);
  private paymentService = inject(PaymentService);
  private toast = inject(ToastService);

  protected bookings = signal<Booking[]>([]);
  protected events = signal(new Map<number, VenueEvent>());
  protected users = signal(new Map<number, User>());
  protected payments = signal(new Map<number, Payment>());
  protected search = signal('');
  protected status = signal('');

  protected filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.bookings().filter(b => {
      const text = `${b.bookingReference} ${this.users().get(b.userId)?.name ?? ''} ${this.events().get(b.eventId)?.title ?? ''}`.toLowerCase();
      return text.includes(q) && (!this.status() || b.status === this.status());
    });
  });

  ngOnInit() { this.load(); }

  load() {
    forkJoin({
      bookings: this.bookingService.getAll(), events: this.eventService.getAll(),
      users: this.userService.getAll(), payments: this.paymentService.getAll(),
    }).subscribe(d => {
      this.bookings.set(d.bookings.sort((a, b) => b.bookingTime.localeCompare(a.bookingTime)));
      this.events.set(new Map(d.events.map(e => [e.id!, e])));
      this.users.set(new Map(d.users.map(u => [u.id!, u])));
      this.payments.set(new Map(d.payments.map(p => [p.bookingId, p])));
    });
  }

  cancel(b: Booking) {
    if (!confirm(`Cancel booking ${b.bookingReference}?`)) return;
    this.bookingService.cancel(b.id).subscribe(() => { this.toast.success('Booking cancelled'); this.load(); });
  }
}
