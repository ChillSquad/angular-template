import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SseService implements OnDestroy {
  private eventSource?: EventSource;

  connect<T>(url: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('[SSE] connected:', url);
      };

      this.eventSource.onmessage = (event: MessageEvent) => {
        subscriber.next(JSON.parse(event.data) as T);
      };

      this.eventSource.onerror = () => {
        console.warn('[SSE] connection lost, browser will retry...');
      };

      return () => {
        this.eventSource?.close();
        this.eventSource = undefined;
        console.log('[SSE] closed:', url);
      };
    });
  }

  join(baseUrl: string): Promise<void> {
    return fetch(`${baseUrl}/join`, { method: 'POST' }).then(() => undefined);
  }

  leave(baseUrl: string): Promise<void> {
    return fetch(`${baseUrl}/leave`, { method: 'POST' }).then(() => undefined);
  }

  ngOnDestroy(): void {
    this.eventSource?.close();
  }
}
