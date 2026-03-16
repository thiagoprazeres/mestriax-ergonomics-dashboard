import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';

export interface CardItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: LucideIconData;
}

@Component({
  selector: 'app-card-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @for (card of items(); track card.id) {
        <button
          type="button"
          class="group flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:border-primary-300 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:outline-none"
          (click)="cardClick.emit(card)"
        >
          @if (card.icon) {
            <lucide-icon [img]="card.icon" [size]="28" class="text-primary-500" />
          }
          <span class="text-base font-semibold text-gray-800 group-hover:text-primary-500 transition-colors">{{ card.title }}</span>
          @if (card.subtitle) {
            <span class="text-sm text-gray-400">{{ card.subtitle }}</span>
          }
        </button>
      }
    </div>
  `,
})
export class CardList {
  items = input.required<CardItem[]>();
  cardClick = output<CardItem>();
}
