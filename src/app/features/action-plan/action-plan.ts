import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { LucideAngularModule, ClipboardList, Share2 } from 'lucide-angular';
import { Breadcrumb } from '../../shared/layout/breadcrumb';
import { KpiCard } from '../../shared/ui/kpi-card';
import { ChartCard } from '../../shared/ui/chart-card';
import { DataGridCard } from '../../shared/ui/data-grid-card';
import { FilterBar, FilterOption } from '../../shared/ui/filter-bar';
import { DataService } from '../../shared/services/data.service';
import { AepRecord } from '../../shared/models/aep.model';
import { useDashboardContext, toggleFilter } from '../../shared/utils/dashboard-context';
import type { EChartsOption } from 'echarts';
import type { ColDef } from 'ag-grid-community';

interface ActionPlanRow {
  acao: string;
  setor: string;
  responsavel: string;
  prazo: string;
  status: string;
}

@Component({
  selector: 'app-action-plan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, KpiCard, ChartCard, DataGridCard, FilterBar, LucideAngularModule],
  template: `
    <app-breadcrumb [items]="breadcrumbs()" />
    <div class="mb-6 flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        @if (ctx.clientLogo()) {
          <img [src]="ctx.clientLogo()" [alt]="ctx.clientName()" width="40" height="40" class="rounded" />
        }
        <div>
          <h1 class="mb-1 text-2xl font-bold text-gray-800 dark:text-gray-100">Gestão do Plano de Ação</h1>
          <p class="text-sm text-gray-400 dark:text-gray-500">Acompanhamento de ações — {{ ctx.unitName() }}</p>
        </div>
      </div>
      <button type="button"
        class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        (click)="copyShareLink()">
        <lucide-icon [img]="ShareIcon" [size]="16" />
        <span class="hidden sm:inline">Compartilhar</span>
      </button>
    </div>

    @if (loading()) {
      <div class="flex items-center justify-center py-20">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
        <span class="ml-3 text-sm text-gray-500 dark:text-gray-400">Carregando dados…</span>
      </div>
    } @else if (allData().length === 0) {
      <div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-600">
        <lucide-icon [img]="ClipboardListIcon" [size]="40" class="text-gray-300" />
        <p class="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">Nenhum plano de ação disponível</p>
        <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Importe dados pela Gestão de Dados</p>
      </div>
    } @else {
    <app-filter-bar
      [filters]="filterOptions()"
      (filterChange)="onFilterChange($event)"
      (clearAll)="clearFilters()"
    />

    <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <app-kpi-card label="Planos abertos" [value]="planosAbertos()" />
      <app-kpi-card label="Planos concluídos" [value]="planosConcluidos()" />
      <app-kpi-card label="Planos atrasados" [value]="planosAtrasados()" />
    </div>

    <div class="mb-6 grid gap-4 lg:grid-cols-2">
      <app-chart-card title="Status dos Planos" [options]="statusPieOptions()"
        [activeFilter]="filterStatus()" [clearFilter]="clearStatus"
        (chartClick)="onChartClick($event, filterStatus)" />
      <app-chart-card title="Planos por Setor" [options]="planoSetorOptions()"
        [activeFilter]="filterSetor()" [clearFilter]="clearSetor"
        (chartClick)="onChartClick($event, filterSetor)" />
    </div>

    <app-data-grid-card title="Detalhamento Plano de Ação" [rowData]="filteredPlans()" [columnDefs]="columns" />
    }
  `,
})
export class ActionPlan implements OnInit {
  private readonly dataService = inject(DataService);
  readonly ctx = useDashboardContext();
  readonly breadcrumbs = this.ctx.breadcrumbs('Plano de Ação');
  readonly ClipboardListIcon = ClipboardList;
  readonly ShareIcon = Share2;

  copyShareLink(): void {
    const url = `${location.origin}/compartilhar/${this.ctx.clientSlug()}/${this.ctx.unitSlug()}/plano-de-acao`;
    navigator.clipboard.writeText(url).then(() => alert('Link copiado!'));
  }

  readonly loading = signal(true);

  readonly allData = signal<AepRecord[]>([]);
  readonly filterSetor = signal('');
  readonly filterStatus = signal('');

  readonly clearSetor = () => this.filterSetor.set('');
  readonly clearStatus = () => this.filterStatus.set('');

  readonly plans = computed<ActionPlanRow[]>(() =>
    this.allData()
      .filter((r) => r.planoAcao)
      .map((r) => ({
        acao: r.planoAcao,
        setor: r.setor,
        responsavel: r.responsavel || 'A definir',
        prazo: r.prazo || 'A definir',
        status: this.deriveStatus(r),
      }))
  );

  readonly filteredPlans = computed(() => {
    let data = this.plans();
    const setor = this.filterSetor();
    const status = this.filterStatus();
    if (setor) data = data.filter((r) => r.setor === setor);
    if (status) data = data.filter((r) => r.status === status);
    return data;
  });

  readonly setores = computed(() => [...new Set(this.plans().map((r) => r.setor).filter(Boolean))].sort());
  readonly statuses = computed(() => [...new Set(this.plans().map((r) => r.status).filter(Boolean))].sort());

  readonly filterOptions = computed<FilterOption[]>(() => [
    { label: 'Setor', key: 'setor', options: this.setores(), selected: this.filterSetor() },
    { label: 'Status', key: 'status', options: this.statuses(), selected: this.filterStatus() },
  ]);

  readonly planosAbertos = computed(() => this.filteredPlans().filter((r) => r.status === 'Aberto').length);
  readonly planosConcluidos = computed(() => this.filteredPlans().filter((r) => r.status === 'Concluído').length);
  readonly planosAtrasados = computed(() => this.filteredPlans().filter((r) => r.status === 'Atrasado').length);

  private readonly STATUS_COLORS: Record<string, string> = {
    'Concluído': '#78c890', 'Aberto': '#f59e0b', 'Atrasado': '#ef4444',
  };

  readonly statusPieOptions = computed<EChartsOption>(() => {
    const map = new Map<string, number>();
    for (const r of this.filteredPlans()) {
      map.set(r.status, (map.get(r.status) ?? 0) + 1);
    }
    const data = [...map.entries()].map(([name, value]) => ({ name, value }));
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, type: 'scroll' },
      color: data.map((d) => this.STATUS_COLORS[d.name] ?? '#6366f1'),
      series: [{
        type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false }, emphasis: { label: { show: true, fontWeight: 'bold' } },
        data,
      }],
    };
  });

  readonly planoSetorOptions = computed<EChartsOption>(() => {
    const map = new Map<string, number>();
    for (const r of this.filteredPlans()) {
      if (r.setor) map.set(r.setor, (map.get(r.setor) ?? 0) + 1);
    }
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: entries.map(([s]) => s), axisLabel: { rotate: 30 } },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: entries.map(([, v]) => v), itemStyle: { color: '#176b5b', borderRadius: [4, 4, 0, 0] } }],
    };
  });

  readonly columns: ColDef[] = [
    { field: 'acao', headerName: 'Ação', flex: 2 },
    { field: 'setor', headerName: 'Setor' },
    { field: 'responsavel', headerName: 'Responsável' },
    { field: 'prazo', headerName: 'Prazo' },
    { field: 'status', headerName: 'Status' },
  ];

  ngOnInit(): void {
    this.dataService.loadAep().then((data) => {
      this.allData.set(data);
      this.loading.set(false);
    });
  }

  onFilterChange(event: { key: string; value: string }): void {
    if (event.key === 'setor') this.filterSetor.set(event.value);
    if (event.key === 'status') this.filterStatus.set(event.value);
  }

  clearFilters(): void {
    this.filterSetor.set('');
    this.filterStatus.set('');
  }

  onChartClick(event: Record<string, unknown>, filterSignal: ReturnType<typeof signal<string>>): void {
    toggleFilter(filterSignal, event['name'] as string | undefined);
  }

  private deriveStatus(r: AepRecord): string {
    if (r.status === 'Concluído') return 'Concluído';
    if (r.prazo) {
      const parts = r.prazo.split('/');
      if (parts.length === 3) {
        const prazoDate = new Date(+parts[2], +parts[0] - 1, +parts[1]);
        if (prazoDate.getTime() < Date.now()) return 'Atrasado';
      }
    }
    return 'Aberto';
  }
}
