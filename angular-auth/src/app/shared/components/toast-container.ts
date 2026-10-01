import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast toast-{{ t.type }}" (click)="toast.dismiss(t.id)">
          <span class="toast-icon">{{ t.type === 'success' ? '✓' : t.type === 'error' ? '!' : 'i' }}</span>
          <span>{{ t.text }}</span>
        </div>
      }
    </div>
  `,
})
export class ToastContainer {
  protected toast = inject(ToastService);
}
