import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ServerCostResponse, ServerPower } from '../server-monitor.models';

@Component({
  selector: 'app-power-panel',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <article class="panel-card">
      <div class="panel-header">
        <span>Power Consumption</span>
        <strong>{{ power?.watts === null || power?.watts === undefined ? 'N/A' : (power?.watts | number: '1.0-2') + ' W' }}</strong>
      </div>
      <p>Source: {{ power?.powerSource ?? 'placeholder' }}</p>
      <div class="cost-grid" *ngIf="cost">
        <span>Daily {{ cost.dailyCost | currency }}</span>
        <span>Weekly {{ cost.weeklyCost | currency }}</span>
        <span>Monthly {{ cost.monthlyCost | currency }}</span>
      </div>
    </article>
  `,
  styleUrl: './panel-card.scss'
})
export class PowerPanelComponent {
  @Input() power: ServerPower | null = null;
  @Input() cost: ServerCostResponse | null = null;
}
