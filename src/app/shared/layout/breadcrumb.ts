import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav aria-label="Breadcrumb" class="mb-4 flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
      @for (item of items(); track item.label; let last = $last) {
        @if (item.route && !last) {
          <a [routerLink]="item.route" class="hover:text-primary-500 transition-colors dark:hover:text-primary-300">{{ item.label }}</a>
        } @else {
          <span [class]="last ? 'font-medium text-gray-800 dark:text-gray-100' : ''">{{ item.label }}</span>
        }
        @if (!last) {
          <span aria-hidden="true" class="mx-1">/</span>
        }
      }
    </nav>
  `,
})
export class Breadcrumb {
  items = input.required<BreadcrumbItem[]>();
}
