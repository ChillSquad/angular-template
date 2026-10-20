import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SseService implements OnDestroy {
  private eventSource?: EventSource;

  connect<T>(url: string, onOpen?: () => void): Observable<T> {
    return new Observable<T>((subscriber) => {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('[SSE] connected:', url);
        onOpen?.();
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

  async join(baseUrl: string): Promise<boolean> {
    return this.post(baseUrl, '/join');
  }

  async leave(baseUrl: string): Promise<boolean> {
    return this.post(baseUrl, '/leave');
  }

  private async post(baseUrl: string, path: string): Promise<boolean> {
    try {
      const res = await fetch(`${baseUrl}${path}`, { method: 'POST' });
      if (!res.ok) {
        console.error(`[SSE] POST ${path} failed: ${res.status}`);
        return false;
      }
      console.log(`[SSE] POST ${path} ok`);
      return true;
    } catch (err) {
      console.error(`[SSE] POST ${path} network error:`, err);
      return false;
    }
  }

  ngOnDestroy(): void {
    this.eventSource?.close();
  }
}
