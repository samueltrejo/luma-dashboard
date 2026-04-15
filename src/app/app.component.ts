import { Component } from '@angular/core';
import { AiUsageComponent } from './components/ai-usage/ai-usage.component';
import { ServerMonitorComponent } from './components/server-monitor/server-monitor.component';

@Component({
  selector: 'app-root',
  imports: [ServerMonitorComponent, AiUsageComponent],
  template: `
    <main class="shell">
      <header class="branding">
        <h1>Luma Dashboard ✨</h1>
        <p>
          Created by Luma ✨ &
          <a href="https://www.twitch.tv/majestech_" target="_blank" rel="noopener noreferrer">&#64;samueltrejo</a>
        </p>
      </header>

      <app-ai-usage></app-ai-usage>
      <app-server-monitor></app-server-monitor>
    </main>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {}
