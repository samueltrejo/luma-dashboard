import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CodexUsageResponse, CodexUsageSnapshot } from './ai-usage.models';

@Component({
  selector: 'app-ai-usage',
  standalone: true,
  imports: [CommonModule],
  template: `
      <ng-container *ngIf="loading(); else content">
        <div class="loading">Loading Codex usage...</div>
      </ng-container>

      <ng-template #content>
        <div class="error" *ngIf="error()">{{ error() }}</div>

        <ng-container *ngIf="!error()">
          <article class="panel-card" *ngFor="let window of windows()">
            <div class="panel-header">
              <span>{{ window.windowName }}</span>
              <strong>{{ formatPercentLeft(window) }}</strong>
            </div>

            <div class="usage-meter">
              <div class="usage-bar compact">
                <div
                  class="usage-fill"
                  [class.warn]="leftPercent(window) <= 30 && leftPercent(window) > 10"
                  [class.danger]="leftPercent(window) <= 10"
                  [style.width.%]="leftPercent(window)"
                ></div>
              </div>
              <div class="reset-time">Resets {{ formatResetTime(window.resetAt) }}</div>
            </div>
          </article>
        </ng-container>
      </ng-template>
  `,
  styleUrl: './ai-usage.component.scss'
})
export class AiUsageComponent {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly windows = signal<CodexUsageSnapshot[]>([]);
  readonly history = signal<CodexUsageSnapshot[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly latestUpdatedAt = computed(() => this.windows()[0]?.capturedAt ?? null);

  constructor() {
    interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.http.get<CodexUsageResponse>('/api/ai-usage/codex')),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.windows.set(response.windows ?? []);
          this.history.set(response.history ?? []);
          this.loading.set(false);
          this.error.set('');
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Unable to reach the AI usage API.');
        }
      });
  }

  clampPercent(percent: number | null): number {
    if (percent == null || Number.isNaN(percent)) {
      return 0;
    }

    return Math.max(0, Math.min(100, percent));
  }

  usedPercent(percent: number | null): number {
    return this.clampPercent(percent);
  }

  leftPercent(snapshot: CodexUsageSnapshot): number {
    return Math.max(0, 100 - this.usedPercent(snapshot.usagePercent));
  }

  formatPercentLeft(snapshot: CodexUsageSnapshot): string {
    return snapshot.usagePercent == null ? 'N/A left' : `${this.leftPercent(snapshot).toFixed(0)}% left`;
  }

  formatResetTime(resetAt: string | null): string {
    if (!resetAt) {
      return 'Unknown';
    }

    return new Date(resetAt).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

}
