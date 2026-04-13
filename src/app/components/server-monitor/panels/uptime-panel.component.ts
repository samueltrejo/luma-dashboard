import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-uptime-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="panel-card">
      <div class="panel-header">
        <span>Uptime</span>
        <strong>{{ humanize(uptimeSeconds) }}</strong>
      </div>
      <p>Server has been online continuously.</p>
    </article>
  `,
  styleUrl: './panel-card.scss'
})
export class UptimePanelComponent {
  @Input() uptimeSeconds = 0;

  humanize(value: number): string {
    const days = Math.floor(value / 86400);
    const hours = Math.floor((value % 86400) / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    return [days ? `${days}d` : null, hours ? `${hours}h` : null, `${minutes}m`].filter(Boolean).join(' ');
  }
}
