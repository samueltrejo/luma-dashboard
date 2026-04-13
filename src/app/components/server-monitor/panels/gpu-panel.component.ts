import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ServerGpuPlaceholder } from '../server-monitor.models';

@Component({
  selector: 'app-gpu-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="panel-card">
      <div class="panel-header">
        <span>GPU</span>
        <strong>Coming soon</strong>
      </div>
      <p>{{ gpu?.message || 'No GPU detected — coming soon 🖥️' }}</p>
    </article>
  `,
  styleUrl: './panel-card.scss'
})
export class GpuPanelComponent {
  @Input() gpu: ServerGpuPlaceholder | null = null;
}
