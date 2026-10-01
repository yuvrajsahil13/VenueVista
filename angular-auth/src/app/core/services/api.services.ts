import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Booking, BookingRequest, EventCategory, EventStatus, Payment, PaymentConfig, RazorpayOrder, RazorpayVerifyRequest,
  Review, Seat, Ticket, User, Venue, VenueEvent,
} from '../models/models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class VenueService {
  private http = inject(HttpClient);
  getAll(): Observable<Venue[]> { return this.http.get<Venue[]>(`${API}/venues`); }
  getById(id: number): Observable<Venue> { return this.http.get<Venue>(`${API}/venues/${id}`); }
  searchByCity(city: string): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${API}/venues/search`, { params: new HttpParams().set('city', city) });
  }
  create(v: Venue): Observable<Venue> { return this.http.post<Venue>(`${API}/venues`, v); }
  update(id: number, v: Venue): Observable<Venue> { return this.http.put<Venue>(`${API}/venues/${id}`, v); }
  delete(id: number): Observable<string> { return this.http.delete(`${API}/venues/${id}`, { responseType: 'text' }); }
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  getAll(): Observable<VenueEvent[]> { return this.http.get<VenueEvent[]>(`${API}/events`); }
  getById(id: number): Observable<VenueEvent> { return this.http.get<VenueEvent>(`${API}/events/${id}`); }
  getByStatus(s: EventStatus): Observable<VenueEvent[]> { return this.http.get<VenueEvent[]>(`${API}/events/status/${s}`); }
  getByCategory(c: EventCategory): Observable<VenueEvent[]> { return this.http.get<VenueEvent[]>(`${API}/events/category/${c}`); }
  create(e: VenueEvent): Observable<VenueEvent> { return this.http.post<VenueEvent>(`${API}/events`, e); }
  update(id: number, e: VenueEvent): Observable<VenueEvent> { return this.http.put<VenueEvent>(`${API}/events/${id}`, e); }
  delete(id: number): Observable<string> { return this.http.delete(`${API}/events/${id}`, { responseType: 'text' }); }
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  getAll(): Observable<Ticket[]> { return this.http.get<Ticket[]>(`${API}/tickets`); }
  getByEvent(eventId: number): Observable<Ticket[]> { return this.http.get<Ticket[]>(`${API}/tickets/event/${eventId}`); }
  create(t: Ticket): Observable<Ticket> { return this.http.post<Ticket>(`${API}/tickets`, t); }
  delete(id: number): Observable<string> { return this.http.delete(`${API}/tickets/${id}`, { responseType: 'text' }); }
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  getAll(): Observable<Booking[]> { return this.http.get<Booking[]>(`${API}/bookings`); }
  getById(id: number): Observable<Booking> { return this.http.get<Booking>(`${API}/bookings/${id}`); }
  getByUser(userId: number): Observable<Booking[]> { return this.http.get<Booking[]>(`${API}/bookings/user/${userId}`); }
  create(b: BookingRequest): Observable<Booking> { return this.http.post<Booking>(`${API}/bookings`, b); }
  cancel(id: number): Observable<string> { return this.http.put(`${API}/bookings/${id}/cancel`, {}, { responseType: 'text' }); }
  reservedSeats(eventId: number): Observable<string[]> { return this.http.get<string[]>(`${API}/bookings/event/${eventId}/reserved-seats`); }
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  getAll(): Observable<Payment[]> { return this.http.get<Payment[]>(`${API}/payments`); }
  pay(p: Payment): Observable<Payment> { return this.http.post<Payment>(`${API}/payments`, p); }
  config(): Observable<PaymentConfig> { return this.http.get<PaymentConfig>(`${API}/payments/config`); }
  createRazorpayOrder(bookingId: number): Observable<RazorpayOrder> {
    return this.http.post<RazorpayOrder>(`${API}/payments/razorpay/order/${bookingId}`, {});
  }
  verifyRazorpay(body: RazorpayVerifyRequest): Observable<Payment> {
    return this.http.post<Payment>(`${API}/payments/razorpay/verify`, body);
  }
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  getByEvent(eventId: number): Observable<Review[]> { return this.http.get<Review[]>(`${API}/reviews/event/${eventId}`); }
  getByVenue(venueId: number): Observable<Review[]> { return this.http.get<Review[]>(`${API}/reviews/venue/${venueId}`); }
  create(r: Review): Observable<Review> { return this.http.post<Review>(`${API}/reviews`, r); }
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  getAll(): Observable<User[]> { return this.http.get<User[]>(`${API}/users`); }
  update(id: number, u: User): Observable<User> { return this.http.put<User>(`${API}/users/${id}`, u); }
  delete(id: number): Observable<string> { return this.http.delete(`${API}/users/${id}`, { responseType: 'text' }); }
}

@Injectable({ providedIn: 'root' })
export class SeatService {
  private http = inject(HttpClient);
  getByVenue(venueId: number): Observable<Seat[]> { return this.http.get<Seat[]>(`${API}/seats/venue/${venueId}`); }
  generate(venueId: number, rows: number, seatsPerRow: number): Observable<Seat[]> {
    const params = new HttpParams().set('rows', rows).set('seatsPerRow', seatsPerRow);
    return this.http.post<Seat[]>(`${API}/seats/venue/${venueId}/generate`, {}, { params });
  }
  clear(venueId: number): Observable<string> { return this.http.delete(`${API}/seats/venue/${venueId}`, { responseType: 'text' }); }
}
