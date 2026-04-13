import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ServerMonitorComponent } from './components/server-monitor/server-monitor.component';

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
  version: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, ServerMonitorComponent],
  template: `
    <main class="shell">
      <section class="hero-card">
        <p class="eyebrow">Created by Luma ✨</p>
        <h1>{{ title }}</h1>
        <p class="tagline">Your personal command center for infrastructure, family systems, and work.</p>

        <div class="status-grid">
          <article class="status-card">
            <span class="label">Frontend</span>
            <strong>Angular 19</strong>
            <p>Standalone UI with dark-mode server monitoring cards and live polling.</p>
          </article>

          <article class="status-card">
            <span class="label">Backend</span>
            <strong>{{ apiStatusLabel() }}</strong>
            <p>{{ apiMessage() }}</p>
          </article>

          <article class="status-card">
            <span class="label">Focus</span>
            <strong>Homelab visibility</strong>
            <p>CPU, memory, disk, power, and process activity now surface in one place.</p>
          </article>
        </div>

        <div class="meta" *ngIf="lastUpdated() as updated">
          API last checked: {{ updated }}
        </div>
      </section>

      <app-server-monitor />
    </main>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Luma Dashboard ✨';

  private readonly http = inject(HttpClient);

  readonly apiHealthy = signal(false);
  readonly apiMessage = signal('Checking API health...');
  readonly lastUpdated = signal('');

  constructor() {
    this.http.get<HealthResponse>('/api/health').subscribe({
      next: (response) => {
        this.apiHealthy.set(response.status === 'ok');
        this.apiMessage.set(`${response.service} is online and ready.`);
        this.lastUpdated.set(new Date(response.timestamp).toLocaleString());
      },
      error: () => {
        this.apiHealthy.set(false);
        this.apiMessage.set('API is unavailable right now. Check the server container logs.');
        this.lastUpdated.set(new Date().toLocaleString());
      }
    });
  }

  apiStatusLabel(): string {
    return this.apiHealthy() ? 'API healthy' : 'API offline';
  }
}
