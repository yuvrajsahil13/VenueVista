import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  EVENT_CATEGORIES, EVENT_STATUSES, EventCategory, EventStatus, TICKET_TYPES, Ticket, TicketType, Venue, VenueEvent,
} from '../../core/models/models';
import { EventService, TicketService, VenueService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LabelPipe } from '../../shared/pipes/label.pipe';

function endAfterStart(group: AbstractControl): ValidationErrors | null {
  const s = group.get('startTime')?.value, e = group.get('endTime')?.value;
  return s && e && e <= s ? { endBeforeStart: true } : null;
}

@Component({
  selector: 'app-manage-events',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, CurrencyPipe, LabelPipe],
  templateUrl: './manage-events.html',
})
export class ManageEvents implements OnInit {
  private eventService = inject(EventService);
  private venueService = inject(VenueService);
  private ticketService = inject(TicketService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  protected auth = inject(AuthService);

  protected categories = EVENT_CATEGORIES;
  protected statuses = EVENT_STATUSES;
  protected ticketTypes = TICKET_TYPES;

  protected events = signal<VenueEvent[]>([]);
  protected venues = signal<Venue[]>([]);
  protected showForm = signal(false);
  protected editingId = signal<number | null>(null);
  protected statusFilter = signal('');

  protected ticketEvent = signal<VenueEvent | null>(null);
  protected tickets = signal<Ticket[]>([]);

  protected venueMap = computed(() => new Map(this.venues().map(v => [v.id!, v])));
  protected visible = computed(() => {
    const uid = this.auth.user()?.id;
    return this.events()
      .filter(e => this.auth.isAdmin() || e.organizerId === uid)
      .filter(e => !this.statusFilter() || e.status === this.statusFilter())
      .sort((a, b) => b.startTime.localeCompare(a.startTime));
  });

  protected form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    category: ['MUSIC' as EventCategory, Validators.required],
    status: ['PUBLISHED' as EventStatus, Validators.required],
    venueId: [0, [Validators.required, Validators.min(1)]],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    bannerUrl: [''],
  }, { validators: endAfterStart });

  protected ticketForm = this.fb.nonNullable.group({
    ticketType: ['REGULAR' as TicketType, Validators.required],
    price: [499, [Validators.required, Validators.min(0)]],
    totalQuantity: [100, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() { this.load(); }

  load() {
    forkJoin({ events: this.eventService.getAll(), venues: this.venueService.getAll() }).subscribe(({ events, venues }) => {
      this.events.set(events);
      this.venues.set(venues);
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset();
    this.showForm.set(true);
  }

  openEdit(e: VenueEvent) {
    this.editingId.set(e.id!);
    this.form.reset({
      title: e.title, description: e.description ?? '', category: e.category, status: e.status,
      venueId: e.venueId, startTime: e.startTime.slice(0, 16), endTime: e.endTime.slice(0, 16), bannerUrl: e.bannerUrl ?? '',
    });
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const id = this.editingId();
    const existing = this.events().find(e => e.id === id);
    const body: VenueEvent = {
      ...v,
      venueId: Number(v.venueId),
      startTime: this.toBackendDate(v.startTime),
      endTime: this.toBackendDate(v.endTime),
      organizerId: existing?.organizerId ?? this.auth.user()!.id!,
    };
    const req = id ? this.eventService.update(id, body) : this.eventService.create(body);
    req.subscribe(() => {
      this.toast.success(id ? 'Event updated' : 'Event created — now add tickets for it');
      this.showForm.set(false);
      this.load();
    });
  }

  remove(e: VenueEvent) {
    if (!confirm(`Delete event "${e.title}"?`)) return;
    this.eventService.delete(e.id!).subscribe(() => {
      this.toast.success('Event deleted');
      if (this.ticketEvent()?.id === e.id) this.ticketEvent.set(null);
      this.load();
    });
  }

  // ----- Tickets -----
  openTickets(e: VenueEvent) {
    this.ticketEvent.set(e);
    this.ticketForm.reset();
    this.loadTickets();
  }

  loadTickets() {
    const e = this.ticketEvent();
    if (e) this.ticketService.getByEvent(e.id!).subscribe(t => this.tickets.set(t));
  }

  addTicket() {
    const e = this.ticketEvent();
    if (!e || this.ticketForm.invalid) { this.ticketForm.markAllAsTouched(); return; }
    const v = this.ticketForm.getRawValue();
    this.ticketService.create({ ...v, availableQuantity: v.totalQuantity, eventId: e.id! }).subscribe(() => {
      this.toast.success(`${v.ticketType} tickets added`);
      this.ticketForm.reset();
      this.loadTickets();
    });
  }

  removeTicket(t: Ticket) {
    if (!confirm('Delete this ticket tier?')) return;
    this.ticketService.delete(t.id!).subscribe(() => { this.toast.success('Ticket tier deleted'); this.loadTickets(); });
  }

  private toBackendDate(local: string): string {
    return local.length === 16 ? `${local}:00` : local;
  }
}
