# EventVista — Event Ticketing & Venue Management (HCL Training Project P_014)

Full-stack web application built with **Spring Boot 4 + MySQL** backend and **Angular 21 SPA** frontend.

## Project Structure

```text
VenueVista/
├── .github/
│   └── workflows/
│       └── ci.yml
├── angular-auth/
├── auth-backend/
├── README.md
└── .gitignore
```

## Features

- **Auth & roles** — register/login as Attendee or Organizer; seeded Admin; route guards per role
- **Events & venues** — browse, search by city, filter by category/status, event and venue details
- **Seat selection** — cinema-style seat map; booked seats are blocked per event; admins can generate venue layouts
- **Booking flow** — ticket tiers (VIP / Regular / Early Bird), live total calculation, booking reference
- **Payments** — Razorpay checkout (Test Mode) with server-side signature verification; demo mode when keys are not configured
- **QR e-tickets** — printable ticket with QR code; optional e-mail of the ticket after payment
- **My Bookings** — booking status, payment status, cancellation, seat/ticket release, and ticket viewing
- **Reviews** — star ratings on events and venues
- **Admin / Organizer panel** — dashboard, revenue information, tickets sold, charts, CRUD venues/events/ticket tiers, bookings, and user roles
- **Engineering** — DTOs, global exception handler, CORS, lazy-loaded routes, HTTP interceptors (loader + error toasts), reactive forms with validation, signals, and responsive UI

## Technology Stack

### Frontend

- Angular 21
- TypeScript
- HTML
- CSS
- Node.js
- npm

### Backend

- Java 21
- Spring Boot 4
- Spring Data JPA
- Hibernate
- Maven

### Database

- MySQL 8

### Payment

- Razorpay Test Mode

## System Architecture

```text
Angular Frontend
       |
       v
REST API
       |
       v
Spring Boot Controllers
       |
       v
Service Layer
       |
       v
Spring Data JPA / Hibernate
       |
       v
MySQL Database
```

## Application Flow

```text
User
 |
 v
Angular Frontend
 |
 v
Spring Boot REST API
 |
 v
Business Logic / Service Layer
 |
 v
JPA / Hibernate
 |
 v
MySQL
```

## Booking Flow

```text
Browse Events
     |
     v
Select Event
     |
     v
Select Ticket / Seats
     |
     v
Create Booking
     |
     v
Payment
     |
     v
Booking Confirmation
     |
     v
E-Ticket / Booking Details
```

## Run Locally

### Prerequisites

Make sure the following are installed:

- Java 21
- Node.js
- npm
- MySQL 8

Make sure MySQL is running locally on port `3306`.

### Backend

From the project root:

```powershell
cd auth-backend
.\mvnw.cmd spring-boot:run
```

You can also run `EventvistaApplication` directly from IntelliJ IDEA.

Backend API:

```text
http://localhost:8080/api
```

### Frontend

Open another terminal from the project root:

```powershell
cd angular-auth
npm install
npm start
```

Frontend application:

```text
http://localhost:4200
```

The Angular frontend communicates with the Spring Boot backend through REST APIs.

## Database Configuration

The application uses MySQL.

Database:

```text
eventvista
```

MySQL server:

```text
localhost:3306
```

Sensitive database credentials are maintained locally and are not committed to the public repository.

Local secret configuration:

```text
auth-backend/src/main/resources/secrets.properties
```

The `secrets.properties` file is excluded from Git using `.gitignore`.

The application uses externalized configuration for sensitive values.

## Optional Configuration

### Razorpay

Razorpay **Test Mode** keys can be configured locally to enable the payment checkout flow.

Relevant configuration includes:

```text
razorpay.key-id
razorpay.key-secret
```

When Razorpay keys are not configured, the application can operate in demo mode where supported.

### E-mail

E-mail functionality can be configured locally for sending e-tickets after payment.

Relevant configuration includes:

```text
app.mail.enabled
spring.mail.username
spring.mail.password
```

Sensitive credentials should remain outside the public repository.

## Main REST Endpoints

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

## Continuous Integration

The project uses **GitHub Actions** for Continuous Integration.

The workflow is located at:

```text
.github/workflows/ci.yml
```

The CI workflow contains two jobs:

```text
EventVista CI
├── Backend Build
│   ├── Java 21
│   └── Maven build
│
└── Frontend Build
    ├── Node.js 24
    ├── npm ci
    └── Angular build
```

### Backend CI

The backend CI job:

1. Checks out the repository.
2. Sets up Java 21.
3. Configures Maven dependency caching.
4. Builds the Spring Boot backend using the Maven wrapper.

### Frontend CI

The frontend CI job:

1. Checks out the repository.
2. Sets up Node.js 24.
3. Configures npm dependency caching.
4. Installs dependencies using `npm ci`.
5. Builds the Angular frontend using `npm run build`.

The workflow runs automatically when:

- code is pushed to the `main` branch
- a pull request targets the `main` branch

## GitHub Actions Status

The EventVista CI workflow has been configured and successfully executed through GitHub Actions.

Current CI checks:

- Backend Build
- Frontend Build

Both build jobs have successfully completed in GitHub Actions.

## Security and Configuration

Sensitive configuration is not stored directly in the public repository.

The following file is maintained locally:

```text
auth-backend/src/main/resources/secrets.properties
```

This file is excluded from Git using `.gitignore`.

Sensitive values such as:

- Database credentials
- Razorpay secret keys
- Mail credentials

should remain outside the public repository.

## Project Status

The EventVista frontend, Spring Boot backend, and MySQL database are integrated as a full-stack application.

The application currently includes:

- User registration and login
- Attendee, Organizer, and Admin roles
- Role-based route guards
- Event management
- Venue management
- Ticket management
- Seat selection
- Booking management
- Payment processing
- QR e-tickets
- Reviews
- Admin dashboard
- Organizer functionality
- GitHub Actions CI

## Future Scope

- JWT + BCrypt on the backend
- Refund integration through Razorpay
- QR scanning application for gate staff
- Pagination
- Further security enhancements
- Further performance improvements

## Author

**Sahil Yuvraj**

B.Tech Computer Science Engineering
ABES Engineering College, Ghaziabad

## Purpose

This project is developed for academic and industrial training purposes as part of the HCL Industrial Training Program.