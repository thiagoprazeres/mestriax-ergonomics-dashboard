import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-1 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <span class="text-xs font-medium uppercase tracking-wide text-gray-400">{{ label() }}</span>
      <span class="text-2xl font-bold text-gray-800">{{ value() }}</span>
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
