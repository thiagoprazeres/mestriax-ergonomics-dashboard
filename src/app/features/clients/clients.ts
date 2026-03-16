import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Building2 } from 'lucide-angular';
import { Breadcrumb } from '../../shared/layout/breadcrumb';
import { CardList, CardItem } from '../../shared/ui/card-list';
import { MockDataService } from '../../shared/services/mock-data.service';

@Component({
  selector: 'app-clients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, CardList],
  template: `
    <app-breadcrumb [items]="breadcrumbs" />
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Clientes</h1>
      <p class="text-sm text-gray-400">Selecione um cliente para gerenciar</p>
    </div>
    <app-card-list [items]="cards()" (cardClick)="onSelect($event)" />
  `,
})
export class Clients {
  private readonly mockData = inject(MockDataService);
  private readonly router = inject(Router);

  readonly breadcrumbs = [
    { label: 'Início', route: '/clientes' },
    { label: 'Clientes' },
  ];

  readonly cards = computed<CardItem[]>(() =>
    this.mockData.clients.map((c) => ({
      id: c.slug,
      title: c.name,
      subtitle: 'Gestão de Risco Ergonômico',
      icon: Building2,
    }))
  );

  onSelect(card: CardItem): void {
    this.router.navigate(['/clientes', card.id, 'unidades']);
  }
}
