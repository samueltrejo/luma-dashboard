import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-temperature-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="panel-card">
      <div class="panel-header">
        <span>Temperature</span>
        <strong>{{ temperature === null ? 'N/A' : (temperature + '°C') }}</strong>
      </div>
      <p>CPU thermal reading when exposed by the host.</p>
    </article>
  `,
  styleUrl: './panel-card.scss'
})
export class TemperaturePanelComponent {
  @Input() temperature: number | null = null;
}
