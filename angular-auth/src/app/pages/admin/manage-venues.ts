import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Seat, Venue } from '../../core/models/models';
import { SeatService, VenueService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-manage-venues',
  imports: [ReactiveFormsModule],
  templateUrl: './manage-venues.html',
})
export class ManageVenues implements OnInit {
  private venueService = inject(VenueService);
  private seatService = inject(SeatService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  protected venues = signal<Venue[]>([]);
  protected editingId = signal<number | null>(null);
  protected showForm = signal(false);
  protected search = signal('');

  // Seat layout panel
  protected seatVenue = signal<Venue | null>(null);
  protected venueSeats = signal<Seat[]>([]);
  protected seatRows = computed(() => new Set(this.venueSeats().map(s => s.seatRow)).size);
  protected layoutForm = this.fb.nonNullable.group({
    rows: [8, [Validators.required, Validators.min(1), Validators.max(26)]],
    seatsPerRow: [12, [Validators.required, Validators.min(1), Validators.max(40)]],
  });
  protected filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.venues().filter(v => `${v.name} ${v.city}`.toLowerCase().includes(q));
  });

  protected form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    address: ['', Validators.required],
    city: ['', Validators.required],
    capacity: [100, [Validators.required, Validators.min(1)]],
    contactEmail: ['', Validators.email],
    contactPhone: ['', Validators.pattern(/^\d{10}$/)],
    imageUrl: [''],
  });

  ngOnInit() { this.load(); }

  load() { this.venueService.getAll().subscribe(v => this.venues.set(v)); }

  openCreate() { this.editingId.set(null); this.form.reset(); this.showForm.set(true); }

  openEdit(v: Venue) {
    this.editingId.set(v.id!);
    this.form.reset({
      name: v.name, address: v.address, city: v.city, capacity: v.capacity,
      contactEmail: v.contactEmail ?? '', contactPhone: v.contactPhone ?? '', imageUrl: v.imageUrl ?? '',
    });
    this.showForm.set(true);
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const body = this.form.getRawValue() as Venue;
    const id = this.editingId();
    const req = id ? this.venueService.update(id, body) : this.venueService.create(body);
    req.subscribe(() => {
      this.toast.success(id ? 'Venue updated' : 'Venue created');
      this.showForm.set(false);
      this.load();
    });
  }

  remove(v: Venue) {
    if (!confirm(`Delete venue "${v.name}"?`)) return;
    this.venueService.delete(v.id!).subscribe(() => { this.toast.success('Venue deleted'); this.load(); });
  }

  openSeats(v: Venue) {
    this.seatVenue.set(v);
    this.showForm.set(false);
    this.seatService.getByVenue(v.id!).subscribe(s => this.venueSeats.set(s));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  generateSeats() {
    const v = this.seatVenue();
    if (!v || this.layoutForm.invalid) { this.layoutForm.markAllAsTouched(); return; }
    const { rows, seatsPerRow } = this.layoutForm.getRawValue();
    this.seatService.generate(v.id!, rows, seatsPerRow).subscribe(seats => {
      this.venueSeats.set(seats);
      this.toast.success(`Seat layout ready: ${seats.length} seats`);
    });
  }

  clearSeats() {
    const v = this.seatVenue();
    if (!v || !confirm(`Remove the seat layout of "${v.name}"? Events there will switch to general admission.`)) return;
    this.seatService.clear(v.id!).subscribe(() => { this.venueSeats.set([]); this.toast.success('Seat layout removed'); });
  }

  protected value(e: Event): string { return (e.target as HTMLInputElement).value; }
}
