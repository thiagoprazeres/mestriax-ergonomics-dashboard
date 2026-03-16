import { Component, ChangeDetectionStrategy, ViewEncapsulation, input, computed } from '@angular/core';
import { AgCharts } from 'ag-charts-angular';
import type { AgChartOptions } from 'ag-charts-community';

@Component({
  selector: 'app-chart-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgCharts],
  encapsulation: ViewEncapsulation.None,
  styles: `
    app-chart-card ag-charts { display: block; width: 100%; height: 100%; }
    app-chart-card .chart-wrapper { cursor: pointer; transition: box-shadow 0.2s, border-color 0.2s; }
    app-chart-card .chart-wrapper:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    app-chart-card .chart-wrapper.has-filter { border-color: #176b5b; box-shadow: 0 0 0 2px rgba(23,107,91,0.15); }
  `,
  template: `
    <div class="chart-wrapper rounded-xl border bg-white p-5 shadow-sm"
         [class.has-filter]="!!activeFilter()"
         [class.border-gray-100]="!activeFilter()">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-700">{{ title() }}</h3>
        @if (activeFilter()) {
          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            {{ activeFilter() }}
            <button (click)="onClearFilter()" class="ml-0.5 text-emerald-500 hover:text-emerald-800" aria-label="Limpar filtro">✕</button>
          </span>
        }
      </div>
      <div class="h-72">
        <ag-charts [options]="themedOptions()" />
      </div>
    </div>
  `,
})
export class ChartCard {
  title = input.required<string>();
  options = input.required<AgChartOptions>();
  activeFilter = input<string>('');
  clearFilter = input<() => void>();

  readonly themedOptions = computed<AgChartOptions>(() => {
    const opts = this.options();
    return {
      ...opts,
      background: { fill: 'transparent' },
      padding: { top: 4, right: 8, bottom: 4, left: 8 },
    } as AgChartOptions;
  });

  onClearFilter(): void {
    const fn = this.clearFilter();
    if (fn) fn();
  }
}
