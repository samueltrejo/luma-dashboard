import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CodexUsageResponse, CodexUsageSnapshot } from './ai-usage.models';

@Component({
  selector: 'app-ai-usage',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <section class="usage-shell">
      <div class="title-row">
        <div>
          <p class="eyebrow">AI Usage</p>
          <h2>Codex Usage</h2>
        </div>
        <div class="meta" *ngIf="latestUpdatedAt() as updatedAt">
          <strong>Latest snapshot</strong>
          <span>{{ updatedAt | date: 'medium' }}</span>
        </div>
      </div>

      <div class="loading" *ngIf="loading()">Loading Codex usage...</div>
      <div class="error" *ngIf="error()">{{ error() }}</div>

      <div class="panel-grid" *ngIf="windows().length">
        <article class="panel-card" *ngFor="let window of windows()">
          <div class="panel-header">
            <span>{{ window.windowName }}</span>
            <strong>{{ formatPercent(window) }}</strong>
          </div>

          <div class="usage-bar">
            <div
              class="usage-fill"
              [class.warn]="(window.usagePercent ?? 0) >= 70 && (window.usagePercent ?? 0) < 90"
              [class.danger]="(window.usagePercent ?? 0) >= 90"
              [style.width.%]="clampPercent(window.usagePercent)"
            ></div>
          </div>

          <div class="stats-grid">
            <span>Used</span>
            <strong>{{ formatMinutes(window.usageMinutesUsed) }}</strong>
            <span>Limit</span>
            <strong>{{ formatMinutes(window.usageMinutesLimit) }}</strong>
            <span>Reset</span>
            <strong>{{ window.resetAt ? (window.resetAt | date: 'medium') : 'Unknown' }}</strong>
            <span>Source</span>
            <strong>{{ window.source }}</strong>
          </div>
        </article>
      </div>

      <article class="panel-card history-card" *ngIf="history().length">
        <div class="panel-header">
          <span>Recent snapshots</span>
          <strong>{{ history().length }}</strong>
        </div>

        <table>
          <thead>
            <tr>
              <th>Window</th>
              <th>Used</th>
              <th>Limit</th>
              <th>Percent</th>
              <th>Captured</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let snapshot of history()">
              <td>{{ snapshot.windowName }}</td>
              <td>{{ formatMinutes(snapshot.usageMinutesUsed) }}</td>
              <td>{{ formatMinutes(snapshot.usageMinutesLimit) }}</td>
              <td>{{ formatPercent(snapshot) }}</td>
              <td>{{ snapshot.capturedAt | date: 'short' }}</td>
            </tr>
          </tbody>
        </table>
      </article>
    </section>
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

  formatPercent(snapshot: CodexUsageSnapshot): string {
    return snapshot.usagePercent == null ? 'N/A' : `${snapshot.usagePercent.toFixed(1)}%`;
  }

  formatMinutes(value: number | null): string {
    return value == null ? 'N/A' : `${value.toFixed(1)} min`;
  }
}
