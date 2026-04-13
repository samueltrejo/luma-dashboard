import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ServerProcess } from '../server-monitor.models';

@Component({
  selector: 'app-processes-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="panel-card panel-span-2">
      <div class="panel-header">
        <span>Top Processes</span>
        <strong>{{ processes.length }} items</strong>
      </div>

      <table *ngIf="processes.length; else emptyState">
        <thead>
          <tr><th>PID</th><th>User</th><th>CPU</th><th>MEM</th><th>Command</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let process of processes">
            <td>{{ process.pid }}</td>
            <td>{{ process.user }}</td>
            <td>{{ process.cpu | number: '1.0-1' }}%</td>
            <td>{{ process.memory | number: '1.0-1' }}%</td>
            <td class="command">{{ process.command }}</td>
          </tr>
        </tbody>
      </table>

      <ng-template #emptyState><p>No process data available.</p></ng-template>
    </article>
  `,
  styleUrl: './panel-card.scss'
})
export class ProcessesPanelComponent {
  @Input() processes: ServerProcess[] = [];
}
