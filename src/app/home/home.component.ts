import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { ProductUpdate, SseMessage } from '../models/sse-message.model';

import { SseService } from '../services/sse.service';

const SSE_URL = 'http://localhost:3000/sse';

@Component({
  selector: 'app-home',
  standalone: true,
  providers: [],
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatCardModule,
    MatIconModule,
    CommonModule,
    DatePipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private sseService = inject(SseService);
  private router = inject(Router);

  readonly connectionStatus = signal<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  readonly isConnected = signal(false);

  readonly productUpdates = signal<ProductUpdate[]>([]);
  readonly messages = signal<SseMessage[]>([]);

  private sseSubscription?: Subscription;

  ngOnInit(): void {
    this.connectToSse();
  }

  goToProductPage(): void {
    this.router.navigate(['/product-page']);
  }

  connectToSse(): void {
    if (this.isConnected()) return;

    this.connectionStatus.set('connecting');

    this.sseSubscription = this.sseService
      .connectWithRetry<SseMessage | ProductUpdate>(SSE_URL, ['customUpdate', 'specialEvent', 'productUpdate'], 5, 3000)
      .subscribe({
        next: (data) => {
          this.isConnected.set(true);
          this.connectionStatus.set('connected');

          if ('productId' in data) {
            this.productUpdates.update((list) =>
              [data as ProductUpdate, ...list].slice(0, 20),
            );
          } else {
            this.messages.update((list) =>
              [data as SseMessage, ...list].slice(0, 50),
            );
          }
        },
        error: (err) => {
          console.error('[Home] SSE error:', err);
          this.isConnected.set(false);
          this.connectionStatus.set('error');
        },
        complete: () => {
          this.isConnected.set(false);
          this.connectionStatus.set('idle');
        },
      });
  }

  disconnectFromSse(): void {
    this.sseSubscription?.unsubscribe();
    this.sseSubscription = undefined;
    this.isConnected.set(false);
    this.connectionStatus.set('idle');
  }

  toggleConnection(): void {
    if (this.isConnected()) {
      this.disconnectFromSse();
    } else {
      this.connectToSse();
    }
  }

  clearMessages(): void {
    this.messages.set([]);
    this.productUpdates.set([]);
  }

  ngOnDestroy(): void {
    this.disconnectFromSse();
  }
}
