import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { SseMessage } from '../models/sse-message.model';
import { SseService } from '../services/sse.service';

const SSE_URL = 'http://localhost:3000/sse';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DatePipe, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private sseService = inject(SseService);
  private router = inject(Router);

  readonly messages = signal<SseMessage[]>([]);
  readonly isConnected = signal(false);

  private subscription?: Subscription;

  ngOnInit(): void {
    this.connect();
  }

  goToProductPage(): void {
    this.router.navigate(['/product-page']);
  }

  connect(): void {
    if (this.isConnected()) return;

    this.subscription = this.sseService.connect<SseMessage>(SSE_URL).subscribe({
      next: (msg) => {
        this.isConnected.set(true);
        this.messages.update((list) => [msg, ...list].slice(0, 20));
      },
      error: (err) => {
        console.error(err);
        this.isConnected.set(false);
      },
    });
  }

  disconnect(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.isConnected.set(false);
  }

  clear(): void {
    this.messages.set([]);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
