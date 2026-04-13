import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ServerDiskVolume } from '../server-monitor.models';

@Component({
  selector: 'app-disk-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="panel-card panel-span-2">
      <div class="panel-header">
        <span>Disk</span>
        <strong>{{ volumes.length }} volume{{ volumes.length === 1 ? '' : 's' }}</strong>
      </div>

      <table *ngIf="volumes.length; else emptyState">
        <thead>
          <tr><th>Mount</th><th>Usage</th><th>Used / Total</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let volume of volumes">
            <td>{{ volume.mount }}</td>
            <td>
              <div class="usage-row">
                <div class="usage-bar compact">
                  <div class="usage-fill" [class.warn]="volume.usage >= 60 && volume.usage <= 85" [class.danger]="volume.usage > 85" [style.width.%]="volume.usage"></div>
                </div>
                <span>{{ volume.usage }}%</span>
              </div>
            </td>
            <td>{{ formatBytes(volume.used) }} / {{ formatBytes(volume.total) }}</td>
          </tr>
        </tbody>
      </table>

      <ng-template #emptyState><p>No disk metrics available.</p></ng-template>
    </article>
  `,
  styleUrl: './panel-card.scss'
})
export class DiskPanelComponent {
  @Input() volumes: ServerDiskVolume[] = [];

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
