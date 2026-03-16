import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LucideAngularModule, X } from 'lucide-angular';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-chart-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxEchartsDirective, LucideAngularModule],
  template: `
    <div class="rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
         [class.border-emerald-400]="!!activeFilter()"
         [class.shadow-emerald-100]="!!activeFilter()"
         [class.border-gray-100]="!activeFilter()"
         [class.dark:border-gray-700]="!activeFilter()">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ title() }}</h3>
        @if (activeFilter()) {
          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {{ activeFilter() }}
            <button (click)="onClearFilter()" class="ml-0.5 text-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-200" aria-label="Limpar filtro"><lucide-icon [img]="XIcon" [size]="12" /></button>
          </span>
        }
      </div>
      <div echarts [options]="mergedOptions()" (chartClick)="chartClick.emit($event)" class="h-56 w-full sm:h-72"></div>
    </div>
  `,
})
export class ChartCard {
  readonly XIcon = X;
  title = input.required<string>();
  options = input.required<EChartsOption>();
  activeFilter = input<string>('');
  clearFilter = input<() => void>();
  chartClick = output<Record<string, unknown>>();

  readonly mergedOptions = computed<EChartsOption>(() => ({
    ...this.options(),
    toolbox: {
      show: true,
      right: 0,
      top: -6,
      feature: {
        saveAsImage: {
          title: 'Salvar',
          pixelRatio: 2,
          backgroundColor: 'auto',
        },
      },
    },
  }));

  onClearFilter(): void {
    const fn = this.clearFilter();
    if (fn) fn();
  }
}
