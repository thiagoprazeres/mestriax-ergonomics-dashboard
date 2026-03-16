import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { LucideAngularModule, HeartPulse, Share2 } from 'lucide-angular';
import { Breadcrumb } from '../../shared/layout/breadcrumb';
import { KpiCard } from '../../shared/ui/kpi-card';
import { ChartCard } from '../../shared/ui/chart-card';
import { DataGridCard } from '../../shared/ui/data-grid-card';
import { FilterBar, FilterOption } from '../../shared/ui/filter-bar';
import { DataService } from '../../shared/services/data.service';
import { AbsenteeismRecord } from '../../shared/models/absenteeism.model';
import { useDashboardContext, toggleFilter } from '../../shared/utils/dashboard-context';
import type { EChartsOption } from 'echarts';
import type { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-occupational-health',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, KpiCard, ChartCard, DataGridCard, FilterBar, LucideAngularModule],
  template: `
    <app-breadcrumb [items]="breadcrumbs()" />
    <div class="mb-6 flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        @if (ctx.clientLogo()) {
          <img [src]="ctx.clientLogo()" [alt]="ctx.clientName()" width="40" height="40" class="rounded-lg" />
        }
        <div>
          <h1 class="mb-1 text-2xl font-bold text-gray-800 dark:text-gray-100">Saúde Ocupacional</h1>
          <p class="text-sm text-gray-400 dark:text-gray-500">Absenteísmo Osteomuscular — {{ ctx.unitName() }}</p>
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
        <lucide-icon [img]="HeartPulseIcon" [size]="40" class="text-gray-300" />
        <p class="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">Nenhum dado de absenteísmo disponível</p>
        <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Importe dados pela Gestão de Dados</p>
      </div>
    } @else {
    <app-filter-bar
      [filters]="filterOptions()"
      (filterChange)="onFilterChange($event)"
      (clearAll)="clearFilters()"
    />

    <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <app-kpi-card label="Dias perdidos" [value]="totalDias()" />
      <app-kpi-card label="Casos registrados" [value]="totalCasos()" />
      <app-kpi-card label="Setores mais afetados" [value]="setorMaisAfetado()" />
    </div>

    <div class="mb-6 grid gap-4 lg:grid-cols-2">
      <app-chart-card title="Dias Perdidos por Setor" [options]="diasSetorOptions()"
        [activeFilter]="filterSetor()" [clearFilter]="clearSetor"
        (chartClick)="onChartClick($event, filterSetor)" />
      <app-chart-card title="Dias Perdidos por Cargo" [options]="diasCargoOptions()"
        [activeFilter]="filterCargo()" [clearFilter]="clearCargo"
        (chartClick)="onChartClick($event, filterCargo)" />
    </div>
    <div class="mb-6">
      <app-chart-card title="Evolução Mensal de Absenteísmo" [options]="evolucaoOptions()" />
    </div>

    <app-data-grid-card title="Detalhamento Absenteísmo" [rowData]="filteredData()" [columnDefs]="columns" />
    }
  `,
})
export class OccupationalHealth implements OnInit {
  private readonly dataService = inject(DataService);
  readonly ctx = useDashboardContext();
  readonly breadcrumbs = this.ctx.breadcrumbs('Saúde Ocupacional');
  readonly HeartPulseIcon = HeartPulse;
  readonly ShareIcon = Share2;

  copyShareLink(): void {
    const url = `${location.origin}/compartilhar/${this.ctx.clientSlug()}/${this.ctx.unitSlug()}/saude-ocupacional`;
    navigator.clipboard.writeText(url).then(() => alert('Link copiado!'));
  }

  readonly loading = signal(true);

  readonly allData = signal<AbsenteeismRecord[]>([]);
  readonly filterSetor = signal('');
  readonly filterCargo = signal('');
  readonly filterCid = signal('');

  readonly clearSetor = () => this.filterSetor.set('');
  readonly clearCargo = () => this.filterCargo.set('');

  readonly filteredData = computed(() => {
    let data = this.allData();
    const setor = this.filterSetor();
    const cargo = this.filterCargo();
    const cid = this.filterCid();
    if (setor) data = data.filter((r) => r.setor === setor);
    if (cargo) data = data.filter((r) => r.cargo === cargo);
    if (cid) data = data.filter((r) => r.cid === cid);
    return data;
  });

  readonly setores = computed(() => [...new Set(this.allData().map((r) => r.setor).filter(Boolean))].sort());
  readonly cids = computed(() => [...new Set(this.allData().map((r) => r.cid).filter(Boolean))].sort());

  readonly filterOptions = computed<FilterOption[]>(() => [
    { label: 'Setor', key: 'setor', options: this.setores(), selected: this.filterSetor() },
    { label: 'CID', key: 'cid', options: this.cids(), selected: this.filterCid() },
  ]);

  readonly totalDias = computed(() => this.filteredData().reduce((s, r) => s + r.diasPerdidos, 0));
  readonly totalCasos = computed(() => this.filteredData().length);
  readonly setorMaisAfetado = computed(() => {
    const map = new Map<string, number>();
    for (const r of this.filteredData()) {
      if (r.setor) map.set(r.setor, (map.get(r.setor) ?? 0) + r.diasPerdidos);
    }
    let max = '';
    let maxVal = 0;
    for (const [k, v] of map) {
      if (v > maxVal) { max = k; maxVal = v; }
    }
    return max || '—';
  });

  readonly diasSetorOptions = computed<EChartsOption>(() => {
    const map = new Map<string, number>();
    for (const r of this.filteredData()) {
      if (r.setor) map.set(r.setor, (map.get(r.setor) ?? 0) + r.diasPerdidos);
    }
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: entries.map(([s]) => s), axisLabel: { rotate: 30 } },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: entries.map(([, d]) => d), itemStyle: { color: '#176b5b', borderRadius: [4, 4, 0, 0] } }],
    };
  });

  readonly diasCargoOptions = computed<EChartsOption>(() => {
    const map = new Map<string, number>();
    for (const r of this.filteredData()) {
      if (r.cargo) map.set(r.cargo, (map.get(r.cargo) ?? 0) + r.diasPerdidos);
    }
    const entries = [...map.entries()].sort((a, b) => a[1] - b[1]);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      yAxis: { type: 'category', data: entries.map(([c]) => c) },
      xAxis: { type: 'value' },
      series: [{ type: 'bar', data: entries.map(([, d]) => d), itemStyle: { color: '#78c890', borderRadius: [0, 4, 4, 0] } }],
    };
  });

  readonly evolucaoOptions = computed<EChartsOption>(() => {
    const map = new Map<string, number>();
    for (const r of this.filteredData()) {
      if (!r.dataInicio) continue;
      const parts = r.dataInicio.split('/');
      if (parts.length >= 2) {
        const monthKey = `${parts[0].padStart(2, '0')}/${parts[2] ?? '2025'}`;
        map.set(monthKey, (map.get(monthKey) ?? 0) + r.diasPerdidos);
      }
    }
    const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: sorted.map(([m]) => m), boundaryGap: false },
      yAxis: { type: 'value' },
      series: [{
        type: 'line', data: sorted.map(([, d]) => d), smooth: true,
        itemStyle: { color: '#176b5b' }, areaStyle: { opacity: 0.15 },
        symbol: 'circle', symbolSize: 8,
      }],
    };
  });

  readonly columns: ColDef[] = [
    { field: 'matricula', headerName: 'Matrícula' },
    { field: 'cargo', headerName: 'Cargo' },
    { field: 'setor', headerName: 'Setor' },
    { field: 'cid', headerName: 'CID' },
    { field: 'dataInicio', headerName: 'Data Início' },
    { field: 'retorno', headerName: 'Retorno' },
    { field: 'diasPerdidos', headerName: 'Dias Perdidos' },
  ];

  ngOnInit(): void {
    this.dataService.loadAbsenteeism().then((data) => {
      this.allData.set(data);
      this.loading.set(false);
    });
  }

  onFilterChange(event: { key: string; value: string }): void {
    if (event.key === 'setor') this.filterSetor.set(event.value);
    if (event.key === 'cargo') this.filterCargo.set(event.value);
    if (event.key === 'cid') this.filterCid.set(event.value);
  }

  clearFilters(): void {
    this.filterSetor.set('');
    this.filterCargo.set('');
    this.filterCid.set('');
  }

  onChartClick(event: Record<string, unknown>, filterSignal: ReturnType<typeof signal<string>>): void {
    toggleFilter(filterSignal, event['name'] as string | undefined);
  }
}
