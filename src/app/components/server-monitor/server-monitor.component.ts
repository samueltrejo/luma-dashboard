import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { forkJoin, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CpuPanelComponent } from './panels/cpu-panel.component';
import { DiskPanelComponent } from './panels/disk-panel.component';
import { GpuPanelComponent } from './panels/gpu-panel.component';
import { MemoryPanelComponent } from './panels/memory-panel.component';
import { NetworkPanelComponent } from './panels/network-panel.component';
import { PowerPanelComponent } from './panels/power-panel.component';
import { ProcessesPanelComponent } from './panels/processes-panel.component';
import { TemperaturePanelComponent } from './panels/temperature-panel.component';
import { UptimePanelComponent } from './panels/uptime-panel.component';
import { ServerCostResponse, ServerMetricsResponse } from './server-monitor.models';

@Component({
  selector: 'app-server-monitor',
  standalone: true,
  imports: [
    CommonModule,
    CpuPanelComponent,
    MemoryPanelComponent,
    DiskPanelComponent,
    NetworkPanelComponent,
    UptimePanelComponent,
    TemperaturePanelComponent,
    PowerPanelComponent,
    GpuPanelComponent,
    ProcessesPanelComponent
  ],
  template: `
    <section class="monitor-shell">
      <div class="title-row">
        <div>
          <p class="eyebrow">Infrastructure</p>
          <h2>Server Monitor</h2>
        </div>
        <div class="meta" *ngIf="metrics() as current">
          <strong>{{ current.hostname }}</strong>
          <span>Updated {{ updatedLabel() }}</span>
        </div>
      </div>

      <div class="loading" *ngIf="loading()">Collecting live server metrics...</div>
      <div class="error" *ngIf="error()">{{ error() }}</div>

      <div class="panel-grid" *ngIf="metrics() as current">
        <app-cpu-panel [usage]="current.cpu" />
        <app-memory-panel [memory]="current.memory" />
        <app-uptime-panel [uptimeSeconds]="current.uptime" />
        <app-temperature-panel [temperature]="current.temperature" />
        <app-power-panel [power]="current.power" [cost]="cost()" />
        <app-gpu-panel [gpu]="current.gpu" />
        <app-disk-panel [volumes]="current.disk" />
        <app-network-panel [interfaces]="current.network" />
        <app-processes-panel [processes]="current.processes" />
      </div>
    </section>
  `,
  styleUrl: './server-monitor.component.scss'
})
export class ServerMonitorComponent {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly metrics = signal<ServerMetricsResponse | null>(null);
  readonly cost = signal<ServerCostResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly updatedLabel = computed(() => {
    const timestamp = this.metrics()?.timestamp;
    return timestamp ? new Date(timestamp).toLocaleTimeString() : '—';
  });

  constructor() {
    interval(5000)
      .pipe(
        startWith(0),
        switchMap(() =>
          forkJoin({
            metrics: this.http.get<ServerMetricsResponse>('/api/server/metrics'),
            cost: this.http.get<ServerCostResponse>('/api/server/cost')
          })
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ metrics, cost }) => {
          this.metrics.set(metrics);
          this.cost.set(cost);
          this.loading.set(false);
          this.error.set('');
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Unable to reach the server monitoring API.');
        }
      });
  }
}
