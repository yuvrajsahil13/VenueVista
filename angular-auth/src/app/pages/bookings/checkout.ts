import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Booking, PAYMENT_METHODS, Payment, PaymentConfig, RazorpayOrder, Ticket, VenueEvent } from '../../core/models/models';
import { BookingService, EventService, PaymentService, TicketService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LabelPipe } from '../../shared/pipes/label.pipe';

declare global {
  interface Window { Razorpay?: new (options: Record<string, unknown>) => { open(): void; on(event: string, cb: (r: any) => void): void }; }
}

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, CurrencyPipe, DatePipe, LabelPipe],
  templateUrl: './checkout.html',
})
export class Checkout implements OnInit {
  bookingId = input.required<string>();

  private bookingService = inject(BookingService);
  private eventService = inject(EventService);
  private ticketService = inject(TicketService);
  private paymentService = inject(PaymentService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  protected methods = PAYMENT_METHODS;
  protected method = signal('UPI');
  protected booking = signal<Booking | null>(null);
  protected event = signal<VenueEvent | null>(null);
  protected ticket = signal<Ticket | null>(null);
  protected payment = signal<Payment | null>(null);
  protected config = signal<PaymentConfig>({ razorpayEnabled: false, keyId: '', mailEnabled: false });
  protected paying = signal(false);

  ngOnInit() {
    const id = Number(this.bookingId());
    forkJoin({
      booking: this.bookingService.getById(id),
      payments: this.paymentService.getAll(),
      config: this.paymentService.config(),
    }).subscribe({
      next: ({ booking, payments, config }) => {
        if (booking.userId !== this.auth.user()?.id && !this.auth.isAdmin()) {
          this.toast.error('This booking does not belong to you');
          this.router.navigate(['/my-bookings']);
          return;
        }
        this.booking.set(booking);
        this.config.set(config);
        this.payment.set(payments.find(p => p.bookingId === id) ?? null);
        this.eventService.getById(booking.eventId).subscribe(e => this.event.set(e));
        this.ticketService.getByEvent(booking.eventId)
          .subscribe(list => this.ticket.set(list.find(t => t.id === booking.ticketId) ?? null));
      },
      error: () => this.router.navigate(['/my-bookings']),
    });
  }

  pay() {
    if (!this.booking()) return;
    this.paying.set(true);
    if (this.config().razorpayEnabled) this.payWithRazorpay();
    else this.payDemo();
  }

  /** Demo mode: records the payment directly (used when no Razorpay keys are configured). */
  private payDemo() {
    this.paymentService.pay({ bookingId: this.booking()!.id, paymentMethod: this.method() }).subscribe({
      next: p => this.onPaid(p),
      error: () => this.paying.set(false),
    });
  }

  /** Real gateway: create order on backend -> open Razorpay popup -> verify signature on backend. */
  private async payWithRazorpay() {
    try {
      await this.loadRazorpay();
    } catch {
      this.toast.error('Could not load Razorpay. Check your internet connection.');
      this.paying.set(false);
      return;
    }
    const b = this.booking()!;
    this.paymentService.createRazorpayOrder(b.id).subscribe({
      next: (order: RazorpayOrder) => {
        const rzp = new window.Razorpay!({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: 'EventVista',
          description: `${this.event()?.title ?? 'Event tickets'} · ${order.bookingReference}`,
          prefill: { name: order.customerName, email: order.customerEmail, contact: order.customerPhone },
          theme: { color: '#6d28d9' },
          handler: (res: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            this.paymentService.verifyRazorpay({
              bookingId: b.id,
              razorpayOrderId: res.razorpay_order_id,
              razorpayPaymentId: res.razorpay_payment_id,
              razorpaySignature: res.razorpay_signature,
            }).subscribe({ next: p => this.onPaid(p), error: () => this.paying.set(false) });
          },
          modal: { ondismiss: () => this.paying.set(false) },
        });
        rzp.on('payment.failed', (r: any) => {
          this.toast.error(r?.error?.description ?? 'Payment failed');
          this.paying.set(false);
        });
        rzp.open();
      },
      error: () => this.paying.set(false),
    });
  }

  private onPaid(p: Payment) {
    this.payment.set(p);
    this.paying.set(false);
    this.toast.success(this.config().mailEnabled ? 'Payment successful! E-ticket sent to your email 🎉' : 'Payment successful! 🎉');
  }

  private loadRazorpay(): Promise<void> {
    if (window.Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }
}
