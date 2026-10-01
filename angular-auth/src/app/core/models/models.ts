// Mirrors the DTOs of the Spring Boot backend (com.hcl.eventvista.dto)

export type Role = 'ROLE_ADMIN' | 'ROLE_ORGANIZER' | 'ROLE_ATTENDEE';
export type EventCategory = 'MUSIC' | 'CONFERENCE' | 'WORKSHOP' | 'SPORTS' | 'THEATRE' | 'MEETUP' | 'OTHER';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type TicketType = 'VIP' | 'REGULAR' | 'EARLY_BIRD';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export const EVENT_CATEGORIES: EventCategory[] = ['MUSIC', 'CONFERENCE', 'WORKSHOP', 'SPORTS', 'THEATRE', 'MEETUP', 'OTHER'];
export const EVENT_STATUSES: EventStatus[] = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];
export const TICKET_TYPES: TicketType[] = ['VIP', 'REGULAR', 'EARLY_BIRD'];
export const ROLES: Role[] = ['ROLE_ADMIN', 'ROLE_ORGANIZER', 'ROLE_ATTENDEE'];
export const PAYMENT_METHODS = ['UPI', 'CARD', 'NET_BANKING', 'WALLET'];

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: Role;
  phone?: string;
}

export interface Venue {
  id?: number;
  name: string;
  address: string;
  city: string;
  capacity: number;
  contactEmail?: string;
  contactPhone?: string;
  imageUrl?: string;
}

export interface VenueEvent {
  id?: number;
  title: string;
  description?: string;
  category: EventCategory;
  startTime: string;
  endTime: string;
  status: EventStatus;
  bannerUrl?: string;
  venueId: number;
  organizerId: number;
}

export interface Ticket {
  id?: number;
  ticketType: TicketType;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  eventId: number;
}

export interface BookingRequest {
  userId: number;
  eventId: number;
  ticketId: number;
  quantity: number;
  seatNumbers?: string[];
}

export interface Booking {
  id: number;
  bookingReference: string;
  quantity: number;
  totalPrice: number;
  status: BookingStatus;
  bookingTime: string;
  seatNumbers?: string | null;
  userId: number;
  eventId: number;
  ticketId: number;
}

export interface Payment {
  id?: number;
  transactionId?: string;
  paymentMethod: string;
  paymentStatus?: string;
  amount?: number;
  paymentTime?: string;
  bookingId: number;
}

export interface Review {
  id?: number;
  rating: number;
  comment: string;
  userId: number;
  eventId?: number;
  venueId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Seat {
  id?: number;
  seatNumber: string;
  seatRow: string;
  isReserved?: boolean;
  venueId: number;
}

export interface PaymentConfig {
  razorpayEnabled: boolean;
  keyId: string;
  mailEnabled: boolean;
}

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface RazorpayVerifyRequest {
  bookingId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
