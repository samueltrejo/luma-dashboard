import { Component } from '@angular/core';
import { ServerMonitorComponent } from './components/server-monitor/server-monitor.component';

@Component({
  selector: 'app-root',
  imports: [ServerMonitorComponent],
  template: `
    <main class="shell">
      <header class="branding">
        <h1>Luma Dashboard ✨</h1>
        <p>
          Created by Luma ✨ &
          <a href="https://www.twitch.tv/majestech_" target="_blank" rel="noopener noreferrer">&#64;samueltrejo</a>
        </p>
      </header>

      <app-server-monitor></app-server-monitor>
    </main>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {}
