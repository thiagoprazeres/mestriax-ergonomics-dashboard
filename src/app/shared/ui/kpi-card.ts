import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <span class="text-xs font-medium uppercase tracking-wide text-gray-400">{{ label() }}</span>
      <span class="text-xl font-bold text-gray-800 sm:text-2xl">{{ value() }}</span>
      @if (subtitle(); as sub) {
        <span class="text-xs text-gray-400">{{ sub }}</span>
      }
    </div>
  `,
})
export class KpiCard {
  label = input.required<string>();
  value = input.required<string | number>();
  subtitle = input<string>();
}
