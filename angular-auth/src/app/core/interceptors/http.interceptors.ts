import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast.service';

/** Shows the global progress bar while any request is in flight. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};

/** Turns backend errors (GlobalExceptionHandler format) into toast messages. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let message = 'Something went wrong. Please try again.';
      if (err.status === 0) {
        message = 'Cannot reach the server. Is the Spring Boot backend running on port 8080?';
      } else if (err.error && typeof err.error === 'object' && err.error.message) {
        message = err.error.message;
      } else if (typeof err.error === 'string') {
        try { message = JSON.parse(err.error).message ?? message; } catch { message = err.error || message; }
      }
      if (err.status === 500 && /constraint|foreign key/i.test(message)) {
        message = 'This record is linked to other data (events, bookings, ...) and cannot be removed.';
      }
      toast.error(message);
      return throwError(() => err);
    }),
  );
};
