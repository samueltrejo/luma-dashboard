import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ServerMemory } from '../server-monitor.models';

@Component({
  selector: 'app-memory-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="panel-card" *ngIf="memory as current">
      <div class="panel-header">
        <span>Memory</span>
        <strong>{{ current.usage | number: '1.0-1' }}%</strong>
      </div>
      <div class="usage-bar">
        <div class="usage-fill" [class.warn]="current.usage >= 60 && current.usage <= 85" [class.danger]="current.usage > 85" [style.width.%]="current.usage"></div>
      </div>
      <p>{{ formatBytes(current.used) }} / {{ formatBytes(current.total) }} used</p>
      <small>{{ formatBytes(current.free) }} free</small>
    </article>
  `,
  styleUrl: './panel-card.scss'
})
export class MemoryPanelComponent {
  @Input() memory: ServerMemory | null = null;

  formatBytes(value: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = value;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }
}
