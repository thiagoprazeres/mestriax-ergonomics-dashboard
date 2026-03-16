import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity, HeartPulse, ClipboardList, Database } from 'lucide-angular';
import { Breadcrumb } from '../../shared/layout/breadcrumb';
import { CardList, CardItem } from '../../shared/ui/card-list';
import { ClientService } from '../../shared/services/client.service';

@Component({
  selector: 'app-dashboard-selection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, CardList],
  template: `
    <app-breadcrumb [items]="breadcrumbs()" />
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Dashboards — {{ unitName() }}</h1>
      <p class="text-sm text-gray-400">Selecione um dashboard para visualizar</p>
    </div>
    <app-card-list [items]="dashboardCards" (cardClick)="onSelect($event)" />
  `,
})
export class DashboardSelection {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientService = inject(ClientService);

  private readonly clientSlug = signal(this.route.snapshot.paramMap.get('clienteId') ?? '');
  private readonly unitSlug = signal(this.route.snapshot.paramMap.get('unidadeId') ?? '');

  readonly clientName = computed(() => this.clientService.getClient(this.clientSlug())?.name ?? this.clientSlug());
  readonly unitName = computed(() => this.clientService.getUnit(this.clientSlug(), this.unitSlug())?.name ?? this.unitSlug());

  readonly breadcrumbs = computed(() => [
    { label: 'Clientes', route: '/clientes' },
    { label: this.clientName(), route: `/clientes/${this.clientSlug()}/unidades` },
    { label: this.unitName() },
    { label: 'Dashboards' },
  ]);

  readonly dashboardCards: CardItem[] = [
    { id: 'diagnostico-ergonomico', title: 'Diagnóstico Ergonômico', subtitle: 'Análise Ergonômica Preliminar', icon: Activity },
    { id: 'saude-ocupacional', title: 'Saúde Ocupacional', subtitle: 'Absenteísmo Osteomuscular', icon: HeartPulse },
    { id: 'plano-de-acao', title: 'Gestão do Plano de Ação', subtitle: 'Acompanhamento de ações', icon: ClipboardList },
    { id: 'gestao-de-dados', title: 'Gestão de Dados', subtitle: 'Importar, editar e exportar CSV', icon: Database },
  ];

  onSelect(card: CardItem): void {
    this.router.navigate([
      '/clientes', this.clientSlug(),
      'unidades', this.unitSlug(),
      'dashboard', card.id,
    ]);
  }
}
