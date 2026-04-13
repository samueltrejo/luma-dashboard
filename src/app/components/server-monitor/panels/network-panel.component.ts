import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ServerNetworkInterface } from '../server-monitor.models';

@Component({
  selector: 'app-network-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="panel-card panel-span-2">
      <div class="panel-header">
        <span>Network</span>
        <strong>{{ interfaces.length }} interface{{ interfaces.length === 1 ? '' : 's' }}</strong>
      </div>

      <table *ngIf="interfaces.length; else emptyState">
        <thead>
          <tr><th>Name</th><th>In</th><th>Out</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of interfaces">
            <td>{{ item.name }}</td>
            <td>{{ formatBytes(item.bytesIn) }}</td>
            <td>{{ formatBytes(item.bytesOut) }}</td>
          </tr>
        </tbody>
      </table>

      <ng-template #emptyState><p>No network metrics available.</p></ng-template>
    </article>
  `,
  styleUrl: './panel-card.scss'
})
export class NetworkPanelComponent {
  @Input() interfaces: ServerNetworkInterface[] = [];

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
