import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="container section empty not-found">
      <h1>404</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a routerLink="/" class="btn btn-primary">Go home</a>
    </section>
  `,
})
export class NotFound {}
