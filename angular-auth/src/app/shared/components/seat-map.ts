import { Component, computed, input, model } from '@angular/core';
import { Seat } from '../../core/models/models';

/** Cinema-style seat picker. Booked seats are disabled; selection is limited to `max`. */
@Component({
  selector: 'app-seat-map',
  template: `
    <div class="seat-map">
      <div class="stage">STAGE</div>
      <div class="seat-rows">
        @for (row of rows(); track row.label) {
          <div class="seat-row">
            <span class="row-label">{{ row.label }}</span>
            @for (s of row.seats; track s) {
              <button type="button" class="seat"
                      [class.taken]="reservedSet().has(s)"
                      [class.selected]="selected().includes(s)"
                      [disabled]="reservedSet().has(s)"
                      [title]="s + (reservedSet().has(s) ? ' (booked)' : '')"
                      (click)="toggle(s)">{{ s.replace(row.label, '') }}</button>
            }
          </div>
        }
      </div>
      <div class="seat-legend">
        <span><i class="seat demo"></i> Available</span>
        <span><i class="seat demo selected"></i> Selected</span>
        <span><i class="seat demo taken"></i> Booked</span>
      </div>
    </div>
  `,
})
export class SeatMap {
  seats = input.required<Seat[]>();
  reserved = input<string[]>([]);
  max = input(10);
  selected = model<string[]>([]);

  protected reservedSet = computed(() => new Set(this.reserved().map(s => s.toUpperCase())));
  protected rows = computed(() => {
    const map = new Map<string, string[]>();
    for (const s of this.seats()) {
      const row = s.seatRow || s.seatNumber.replace(/\d+/g, '');
      if (!map.has(row)) map.set(row, []);
      map.get(row)!.push(s.seatNumber.toUpperCase());
    }
    return [...map.entries()].map(([label, seats]) => ({ label, seats }));
  });

  toggle(label: string) {
    const current = this.selected();
    if (current.includes(label)) {
      this.selected.set(current.filter(s => s !== label));
    } else if (current.length < this.max()) {
      this.selected.set([...current, label]);
    }
  }
}
