import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

export interface FilterOption {
  label: string;
  key: string;
  options: string[];
  selected: string;
}

@Component({
  selector: 'app-filter-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-6 grid grid-cols-1 items-end gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex sm:flex-wrap sm:gap-4">
      @for (filter of filters(); track filter.key) {
        <div class="flex flex-col gap-1">
          <label [for]="'filter-' + filter.key" class="text-xs font-medium text-gray-500">{{ filter.label }}</label>
          <select
            [id]="'filter-' + filter.key"
            class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none sm:w-auto"
            [value]="filter.selected"
            (change)="onFilterChange(filter.key, $event)"
          >
            <option value="">Todos</option>
            @for (opt of filter.options; track opt) {
              <option [value]="opt">{{ opt }}</option>
            }
          </select>
        </div>
      }
      <button
        type="button"
        class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200"
        (click)="clearAll.emit()"
      >
        Limpar filtros
      </button>
    </div>
  `,
})
export class FilterBar {
  filters = input.required<FilterOption[]>();
  filterChange = output<{ key: string; value: string }>();
  clearAll = output<void>();

  onFilterChange(key: string, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filterChange.emit({ key, value });
  }
}
