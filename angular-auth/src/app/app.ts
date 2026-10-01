import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar';
import { Footer } from './shared/components/footer';
import { ToastContainer } from './shared/components/toast-container';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, ToastContainer],
  template: `
    @if (loading.isLoading()) { <div class="progress-bar"></div> }
    <app-navbar />
    <main class="main"><router-outlet /></main>
    <app-footer />
    <app-toast-container />
  `,
})
export class App {
  protected loading = inject(LoadingService);
}
