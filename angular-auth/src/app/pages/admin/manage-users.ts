import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ROLES, Role, User } from '../../core/models/models';
import { UserService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LabelPipe } from '../../shared/pipes/label.pipe';

@Component({
  selector: 'app-manage-users',
  imports: [LabelPipe],
  template: `
    <div class="admin-head"><h1>Users</h1><p class="muted">{{ users().length }} registered user(s)</p></div>
    <div class="kpis small-kpis">
      @for (r of roles; track r) { <div class="kpi card"><span>{{ r | label }}s</span><strong>{{ count(r) }}</strong></div> }
    </div>
    <div class="card">
      <div class="table-toolbar">
        <input class="input" type="search" placeholder="Search name or email…" (input)="search.set($any($event.target).value)" />
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th></th></tr></thead>
          <tbody>
            @for (u of filtered(); track u.id) {
              <tr>
                <td>{{ u.id }}</td>
                <td><span class="avatar sm">{{ u.name.charAt(0) }}</span> {{ u.name }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.phone }}</td>
                <td>
                  <select class="input input-sm" [value]="u.role" [disabled]="u.id === me()"
                          (change)="changeRole(u, $any($event.target).value)">
                    @for (r of roles; track r) { <option [value]="r">{{ r | label }}</option> }
                  </select>
                </td>
                <td class="actions-cell">
                  @if (u.id !== me()) { <button class="btn btn-danger-ghost btn-sm" (click)="remove(u)">Delete</button> }
                  @else { <span class="muted small">You</span> }
                </td>
              </tr>
            } @empty { <tr><td colspan="6" class="muted">No users found.</td></tr> }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ManageUsers implements OnInit {
  private userService = inject(UserService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  protected roles = ROLES;
  protected users = signal<User[]>([]);
  protected search = signal('');
  protected me = computed(() => this.auth.user()?.id);
  protected filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.users().filter(u => `${u.name} ${u.email}`.toLowerCase().includes(q));
  });

  ngOnInit() { this.load(); }
  load() { this.userService.getAll().subscribe(u => this.users.set(u)); }
  count(r: Role) { return this.users().filter(u => u.role === r).length; }

  changeRole(u: User, role: Role) {
    this.userService.update(u.id!, { ...u, role, password: '' }).subscribe(() => {
      this.toast.success(`${u.name} is now ${role.replace('ROLE_', '').toLowerCase()}`);
      this.load();
    });
  }

  remove(u: User) {
    if (!confirm(`Delete user ${u.name}?`)) return;
    this.userService.delete(u.id!).subscribe(() => { this.toast.success('User deleted'); this.load(); });
  }
}
