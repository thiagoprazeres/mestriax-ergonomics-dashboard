import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-chart-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxEchartsDirective],
  template: `
    <div class="rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
         [class.border-emerald-400]="!!activeFilter()"
         [class.shadow-emerald-100]="!!activeFilter()"
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
      <div echarts [options]="options()" (chartClick)="chartClick.emit($event)" class="h-72 w-full"></div>
    </div>
  `,
})
export class ChartCard {
  title = input.required<string>();
  options = input.required<EChartsOption>();
  activeFilter = input<string>('');
  clearFilter = input<() => void>();
  chartClick = output<Record<string, unknown>>();

  onClearFilter(): void {
    const fn = this.clearFilter();
    if (fn) fn();
  }
}
