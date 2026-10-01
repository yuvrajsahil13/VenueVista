# EventVista — Event Ticketing & Venue Management (HCL Training Project P_014)

Full-stack web app: **Spring Boot 4 + MySQL** backend and **Angular 21 SPA** frontend.

```
EventVista-Project/
├── backend/    Spring Boot REST API (Java 21, JPA, MySQL)
└── frontend/   Angular single page application
```

## Features
- **Auth & roles** — register/login as Attendee or Organizer; seeded Admin; route guards per role
- **Events & venues** — browse, search by city, filter by category/status, event & venue details
- **Seat selection** — cinema-style seat map; booked seats are blocked per event; admins generate venue layouts
- **Booking flow** — ticket tiers (VIP / Regular / Early Bird), live total, booking reference
- **Payments** — Razorpay checkout (Test Mode) with server-side signature verification; demo mode when keys are not set
- **QR e-tickets** — printable ticket with QR code; optional e-mail of the ticket after payment
- **My Bookings** — status, payment, cancel (releases seats & tickets), view ticket
- **Reviews** — star ratings on events and venues
- **Admin / Organizer panel** — dashboard (revenue, tickets sold, charts), CRUD venues/events/ticket tiers, bookings, user roles
- **Engineering** — DTOs, global exception handler, CORS, lazy-loaded routes, HTTP interceptors (loader + error toasts), reactive forms with validation, signals, responsive UI

## Run locally
**Backend** (MySQL running on 3306):
```
cd backend
./mvnw spring-boot:run        # or Run EventvistaApplication in IntelliJ
```
API: http://localhost:8080/api  ·  Default admin: `admin@eventvista.com` / `admin123`

**Frontend**:
```
cd frontend
npm install
ng serve
```
App: http://localhost:4200

## Optional configuration (`backend/src/main/resources/application.properties`)
- `razorpay.key-id` / `razorpay.key-secret` — Razorpay **Test Mode** keys → real checkout popup
- `app.mail.enabled=true` + `spring.mail.username` / `spring.mail.password` (Gmail App Password) → e-tickets by e-mail

## Main REST endpoints
| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Venues | `GET/POST /api/venues`, `GET/PUT/DELETE /api/venues/{id}`, `GET /api/venues/search?city=` |
| Events | `GET/POST /api/events`, `GET/PUT/DELETE /api/events/{id}`, `/status/{s}`, `/category/{c}` |
| Tickets | `GET/POST /api/tickets`, `GET /api/tickets/event/{id}`, `DELETE /api/tickets/{id}` |
| Seats | `GET /api/seats/venue/{id}`, `POST /api/seats/venue/{id}/generate?rows=&seatsPerRow=` |
| Bookings | `POST /api/bookings`, `GET /api/bookings/user/{id}`, `GET /api/bookings/event/{id}/reserved-seats`, `PUT /api/bookings/{id}/cancel` |
| Payments | `GET /api/payments/config`, `POST /api/payments`, `POST /api/payments/razorpay/order/{bookingId}`, `POST /api/payments/razorpay/verify` |
| Reviews / Users | `/api/reviews`, `/api/users` |

## Future scope
JWT + BCrypt on the backend, refunds through Razorpay, QR scanning app for gate staff, pagination.
