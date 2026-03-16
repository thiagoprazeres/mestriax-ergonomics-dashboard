import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MapPin } from 'lucide-angular';
import { Breadcrumb } from '../../shared/layout/breadcrumb';
import { CardList, CardItem } from '../../shared/ui/card-list';
import { MockDataService } from '../../shared/services/mock-data.service';

@Component({
  selector: 'app-units',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, CardList],
  template: `
    <app-breadcrumb [items]="breadcrumbs()" />
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Unidades — {{ clientName() }}</h1>
      <p class="text-sm text-gray-400">Selecione uma unidade</p>
    </div>
    <app-card-list [items]="cards()" (cardClick)="onSelect($event)" />
  `,
})
export class Units {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockData = inject(MockDataService);

  private readonly clientSlug = signal(this.route.snapshot.paramMap.get('clienteId') ?? '');

  readonly clientName = computed(() => {
    const client = this.mockData.getClient(this.clientSlug());
    return client?.name ?? this.clientSlug();
  });

  readonly breadcrumbs = computed(() => [
    { label: 'Clientes', route: '/clientes' },
    { label: this.clientName() },
    { label: 'Unidades' },
  ]);

  readonly cards = computed<CardItem[]>(() =>
    this.mockData.getUnits(this.clientSlug()).map((u) => ({
      id: u.slug,
      title: u.name,
      subtitle: u.location,
      icon: MapPin,
    }))
  );

  onSelect(card: CardItem): void {
    this.router.navigate(['/clientes', this.clientSlug(), 'unidades', card.id, 'dashboard']);
  }
}
