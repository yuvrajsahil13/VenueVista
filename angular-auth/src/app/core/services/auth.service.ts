import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, User } from '../models/models';

const STORAGE_KEY = 'eventvista_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly _user = signal<User | null>(this.restore());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly isAdmin = computed(() => this._user()?.role === 'ROLE_ADMIN');
  /** Admins and organizers can manage venues, events and tickets. */
  readonly canManage = computed(() => ['ROLE_ADMIN', 'ROLE_ORGANIZER'].includes(this._user()?.role ?? ''));

  login(body: LoginRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, body).pipe(tap(u => this.setUser(u)));
  }

  register(body: User): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, body).pipe(tap(u => this.setUser(u)));
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._user.set(null);
  }

  private setUser(user: User): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  private restore(): User | null {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    } catch {
      return null;
    }
  }
}
