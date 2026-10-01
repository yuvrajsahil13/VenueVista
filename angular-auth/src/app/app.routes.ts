import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  { path: '', title: 'EventVista | Home', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'events', title: 'EventVista | Events', loadComponent: () => import('./pages/events/event-list').then(m => m.EventList) },
  { path: 'events/:id', title: 'EventVista | Event', loadComponent: () => import('./pages/events/event-detail').then(m => m.EventDetail) },
  { path: 'venues', title: 'EventVista | Venues', loadComponent: () => import('./pages/venues/venue-list').then(m => m.VenueList) },
  { path: 'venues/:id', title: 'EventVista | Venue', loadComponent: () => import('./pages/venues/venue-detail').then(m => m.VenueDetail) },
  { path: 'login', title: 'EventVista | Login', loadComponent: () => import('./pages/auth/login').then(m => m.Login) },
  { path: 'register', title: 'EventVista | Register', loadComponent: () => import('./pages/auth/register').then(m => m.Register) },
  {
    path: 'my-bookings', title: 'EventVista | My Bookings', canActivate: [authGuard],
    loadComponent: () => import('./pages/bookings/my-bookings').then(m => m.MyBookings),
  },
  {
    path: 'checkout/:bookingId', title: 'EventVista | Checkout', canActivate: [authGuard],
    loadComponent: () => import('./pages/bookings/checkout').then(m => m.Checkout),
  },
  {
    path: 'tickets/:bookingId', title: 'EventVista | E-ticket', canActivate: [authGuard],
    loadComponent: () => import('./pages/bookings/e-ticket').then(m => m.ETicket),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_ORGANIZER'] },
    loadComponent: () => import('./pages/admin/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: '', title: 'Admin | Dashboard', loadComponent: () => import('./pages/admin/dashboard').then(m => m.Dashboard) },
      { path: 'venues', title: 'Admin | Venues', loadComponent: () => import('./pages/admin/manage-venues').then(m => m.ManageVenues) },
      { path: 'events', title: 'Admin | Events', loadComponent: () => import('./pages/admin/manage-events').then(m => m.ManageEvents) },
      {
        path: 'bookings', title: 'Admin | Bookings', canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] },
        loadComponent: () => import('./pages/admin/manage-bookings').then(m => m.ManageBookings),
      },
      {
        path: 'users', title: 'Admin | Users', canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] },
        loadComponent: () => import('./pages/admin/manage-users').then(m => m.ManageUsers),
      },
    ],
  },
  { path: '**', title: 'EventVista | Not found', loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound) },
];
