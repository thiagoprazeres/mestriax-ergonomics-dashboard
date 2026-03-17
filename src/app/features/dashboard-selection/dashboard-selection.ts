import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Activity, HeartPulse, ClipboardList, Database } from 'lucide-angular';
import { Breadcrumb } from '../../shared/layout/breadcrumb';
import { CardList, CardItem } from '../../shared/ui/card-list';
import { useDashboardContext } from '../../shared/utils/dashboard-context';

@Component({
  selector: 'app-dashboard-selection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, CardList],
  template: `
    <app-breadcrumb [items]="breadcrumbs()" />
    <div class="mb-6 flex items-center gap-4">
      @if (ctx.clientLogo()) {
        <img [src]="ctx.clientLogo()" [alt]="ctx.clientName()" width="40" height="40" class="rounded-xs" />
      }
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboards — {{ ctx.unitName() }}</h1>
        <p class="text-sm text-gray-400 dark:text-gray-500">Selecione um dashboard para visualizar</p>
      </div>
    </div>
    <app-card-list [items]="dashboardCards" (cardClick)="onSelect($event)" />
  `,
})
export class DashboardSelection {
  private readonly router = inject(Router);
  readonly ctx = useDashboardContext();
  readonly breadcrumbs = this.ctx.breadcrumbs('Dashboards');

  readonly dashboardCards: CardItem[] = [
    { id: 'diagnostico-ergonomico', title: 'Diagnóstico Ergonômico', subtitle: 'Análise Ergonômica Preliminar', icon: Activity },
    { id: 'saude-ocupacional', title: 'Saúde Ocupacional', subtitle: 'Absenteísmo Osteomuscular', icon: HeartPulse },
    { id: 'plano-de-acao', title: 'Gestão do Plano de Ação', subtitle: 'Acompanhamento de ações', icon: ClipboardList },
    { id: 'gestao-de-dados', title: 'Gestão de Dados', subtitle: 'Importar, editar e exportar CSV', icon: Database },
  ];

  onSelect(card: CardItem): void {
    this.router.navigate([
      '/clientes', this.ctx.clientSlug(),
      'unidades', this.ctx.unitSlug(),
      'dashboard', card.id,
    ]);
  }
}
