import { Injectable, OnDestroy } from '@angular/core';

import { retryWhen, delayWhen, scan, tap } from 'rxjs/operators';
import { Observable, Subject, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SseService implements OnDestroy {
  private eventSources: EventSource[] = [];

  connectToServerSentEvents<T = any>(
    url: string,
    eventTypes: string[] = [],
    options?: EventSourceInit,
  ): Observable<T> {
    const subject = new Subject<T>();
    let eventSource: EventSource;

    const createConnection = () => {
      eventSource = new EventSource(url, options);
      this.eventSources.push(eventSource);

      eventSource.onopen = () => {
        console.log('[SSE] Соединение установлено:', url);
      };

      eventSource.onmessage = (event: MessageEvent) => {
        subject.next(this.parseData<T>(event.data));
      };

      eventTypes.forEach((eventType) => {
        eventSource.addEventListener(eventType, (event: Event) => {
          const msgEvent = event as MessageEvent;
          subject.next(this.parseData<T>(msgEvent.data));
        });
      });

      eventSource.onerror = () => {
        subject.error(new Error('SSE connection error'));
      };
    };

    return new Observable<T>((subscriber) => {
      createConnection();

      const subscription = subject.subscribe({
        next: (data) => subscriber.next(data),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });

      return () => {
        subscription.unsubscribe();
        eventSource?.close();
        const idx = this.eventSources.indexOf(eventSource);
        if (idx > -1) this.eventSources.splice(idx, 1);
        console.log('[SSE] Соединение закрыто:', url);
      };
    });
  }

  connectWithRetry<T = any>(
    url: string,
    eventTypes: string[] = [],
    maxRetries = 5,
    retryDelayMs = 3000,
  ): Observable<T> {
    return this.connectToServerSentEvents<T>(url, eventTypes).pipe(
      retryWhen((errors) =>
        errors.pipe(
          scan((acc, error) => ({ error, count: acc.count + 1 }), {
            error: null as any,
            count: 0,
          }),
          tap(({ error, count }) => {
            if (count > maxRetries) {
              throw error;
            }
            console.warn(
              `[SSE] Переподключение через ${retryDelayMs * count}мс ` +
                `(попытка ${count}/${maxRetries})`,
            );
          }),
          delayWhen(({ count }) => timer(retryDelayMs * count)),
        ),
      ),
    );
  }

  private parseData<T>(data: string): T {
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  ngOnDestroy(): void {
    this.eventSources.forEach((es) => es.close());
    this.eventSources = [];
  }
}
