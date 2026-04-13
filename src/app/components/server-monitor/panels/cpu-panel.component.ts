import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cpu-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="panel-card">
      <div class="panel-header">
        <span>CPU</span>
        <strong>{{ usage | number: '1.0-1' }}%</strong>
      </div>
      <div class="usage-bar">
        <div class="usage-fill" [class.warn]="usage >= 60 && usage <= 85" [class.danger]="usage > 85" [style.width.%]="usage"></div>
      </div>
      <p>Overall processor utilization across the server.</p>
    </article>
  `,
  styleUrl: './panel-card.scss'
})
export class CpuPanelComponent {
  @Input({ required: true }) usage = 0;
}
