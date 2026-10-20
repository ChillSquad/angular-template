import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { SseMessage } from '../models/sse-message.model';
import { SseService } from '../services/sse.service';

const SSE_BASE = 'http://localhost:3000';
const SSE_URL = `${SSE_BASE}/sse`;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  imports: [CommonModule, DatePipe, MatButtonModule],
})
export class HomeComponent implements OnInit, OnDestroy {
  private sseService = inject(SseService);
  private router = inject(Router);

  readonly messages = signal<SseMessage[]>([]);

  readonly desiredPresence = signal(false);

  private sseSub?: Subscription;

  ngOnInit(): void {
    this.sseSub = this.sseService.connect<SseMessage>(SSE_URL).subscribe({
      next: (msg) => {
        this.messages.update((list) => [msg, ...list].slice(0, 50));
      },
      error: (err) => console.error(err),
    });
  }

  goToProductPage(): void {
    this.router.navigate(['/product-page']);
  }

  async joinServer(): Promise<void> {
    this.desiredPresence.set(true);
    await this.sseService.join(SSE_BASE);
  }

  async leaveServer(): Promise<void> {
    this.desiredPresence.set(false);
    await this.sseService.leave(SSE_BASE);
  }

  clear(): void {
    this.messages.set([]);
  }

  ngOnDestroy(): void {
    this.sseSub?.unsubscribe();
  }
}
