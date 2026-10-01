import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="card auth-card">
        <h1>Welcome back</h1>
        <p class="muted">Log in to book tickets and manage your bookings.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label class="field">
            <span>Email</span>
            <input class="input" type="email" formControlName="email" placeholder="you@example.com" autocomplete="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) { <small class="error">Enter a valid email address.</small> }
          </label>
          <label class="field">
            <span>Password</span>
            <input class="input" type="password" formControlName="password" placeholder="••••••••" autocomplete="current-password" />
            @if (form.controls.password.touched && form.controls.password.invalid) { <small class="error">Password is required.</small> }
          </label>
          <button class="btn btn-primary btn-block" type="submit" [disabled]="submitting()">
            {{ submitting() ? 'Logging in…' : 'Log in' }}
          </button>
        </form>

        <p class="muted center">New to EventVista? <a routerLink="/register" class="link">Create an account</a></p>
        <p class="hint">Demo admin: admin&#64;eventvista.com / admin123</p>
      </div>
    </section>
  `,
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  protected submitting = signal(false);

  protected form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: user => {
        this.toast.success(`Welcome back, ${user.name}!`);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || (user.role === 'ROLE_ATTENDEE' ? '/events' : '/admin'));
      },
      error: () => this.submitting.set(false),
    });
  }
}
