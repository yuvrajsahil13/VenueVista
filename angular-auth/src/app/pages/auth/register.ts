import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Role } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  return group.get('password')?.value === group.get('confirmPassword')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="card auth-card">
        <h1>Create your account</h1>
        <p class="muted">Join EventVista to book events or host your own.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="role-switch">
            <label [class.active]="form.controls.role.value === 'ROLE_ATTENDEE'">
              <input type="radio" formControlName="role" value="ROLE_ATTENDEE" /> 🎟️ I want to attend events
            </label>
            <label [class.active]="form.controls.role.value === 'ROLE_ORGANIZER'">
              <input type="radio" formControlName="role" value="ROLE_ORGANIZER" /> 🎤 I organize events
            </label>
          </div>

          <label class="field">
            <span>Full name</span>
            <input class="input" formControlName="name" placeholder="Ritesh Singh" />
            @if (f.name.touched && f.name.invalid) { <small class="error">Name must be at least 3 characters.</small> }
          </label>
          <div class="row">
            <label class="field grow">
              <span>Email</span>
              <input class="input" type="email" formControlName="email" placeholder="you@example.com" />
              @if (f.email.touched && f.email.invalid) { <small class="error">Enter a valid email address.</small> }
            </label>
            <label class="field grow">
              <span>Phone</span>
              <input class="input" formControlName="phone" placeholder="10-digit mobile" maxlength="10" />
              @if (f.phone.touched && f.phone.invalid) { <small class="error">Enter a valid 10-digit number.</small> }
            </label>
          </div>
          <div class="row">
            <label class="field grow">
              <span>Password</span>
              <input class="input" type="password" formControlName="password" />
              @if (f.password.touched && f.password.invalid) { <small class="error">At least 6 characters.</small> }
            </label>
            <label class="field grow">
              <span>Confirm password</span>
              <input class="input" type="password" formControlName="confirmPassword" />
              @if (f.confirmPassword.touched && form.hasError('mismatch')) { <small class="error">Passwords do not match.</small> }
            </label>
          </div>
          <button class="btn btn-primary btn-block" type="submit" [disabled]="submitting()">
            {{ submitting() ? 'Creating account…' : 'Create account' }}
          </button>
        </form>
        <p class="muted center">Already have an account? <a routerLink="/login" class="link">Log in</a></p>
      </div>
    </section>
  `,
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  protected submitting = signal(false);

  protected form = this.fb.nonNullable.group({
    role: ['ROLE_ATTENDEE' as Role],
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const { confirmPassword, ...user } = this.form.getRawValue();
    this.auth.register(user).subscribe({
      next: u => {
        this.toast.success(`Account created. Welcome, ${u.name}!`);
        this.router.navigate([u.role === 'ROLE_ORGANIZER' ? '/admin' : '/events']);
      },
      error: () => this.submitting.set(false),
    });
  }
}
