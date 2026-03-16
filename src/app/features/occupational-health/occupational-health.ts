import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from '../../shared/layout/breadcrumb';
import { KpiCard } from '../../shared/ui/kpi-card';
import { ChartCard } from '../../shared/ui/chart-card';
import { DataGridCard } from '../../shared/ui/data-grid-card';
import { FilterBar, FilterOption } from '../../shared/ui/filter-bar';
import { CsvService } from '../../shared/services/csv.service';
import { MockDataService } from '../../shared/services/mock-data.service';
import { AbsenteeismRecord } from '../../shared/models/absenteeism.model';
import type { AgChartOptions } from 'ag-charts-community';
import type { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-occupational-health',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, KpiCard, ChartCard, DataGridCard, FilterBar],
  template: `
    <app-breadcrumb [items]="breadcrumbs()" />
    <h1 class="mb-1 text-2xl font-bold text-gray-800">Saúde Ocupacional</h1>
    <p class="mb-6 text-sm text-gray-400">Absenteísmo Osteomuscular — {{ unitName() }}</p>

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
        [activeFilter]="filterSetor()" [clearFilter]="clearSetor" />
      <app-chart-card title="Dias Perdidos por Cargo" [options]="diasCargoOptions()"
        [activeFilter]="filterCargo()" [clearFilter]="clearCargo" />
    </div>
    <div class="mb-6">
      <app-chart-card title="Evolução Mensal de Absenteísmo" [options]="evolucaoOptions()" />
    </div>

    <app-data-grid-card title="Detalhamento Absenteísmo" [rowData]="filteredData()" [columnDefs]="columns" />
  `,
})
export class OccupationalHealth implements OnInit {
  private readonly csv = inject(CsvService);
  private readonly route = inject(ActivatedRoute);
  private readonly mockData = inject(MockDataService);

  private readonly clientSlug = signal(this.route.snapshot.paramMap.get('clienteId') ?? '');
  private readonly unitSlug = signal(this.route.snapshot.paramMap.get('unidadeId') ?? '');

  readonly clientName = computed(() => this.mockData.getClient(this.clientSlug())?.name ?? this.clientSlug());
  readonly unitName = computed(() => this.mockData.getUnit(this.clientSlug(), this.unitSlug())?.name ?? this.unitSlug());

  readonly breadcrumbs = computed(() => [
    { label: 'Clientes', route: '/clientes' },
    { label: this.clientName(), route: `/clientes/${this.clientSlug()}/unidades` },
    { label: this.unitName(), route: `/clientes/${this.clientSlug()}/unidades/${this.unitSlug()}/dashboard` },
    { label: 'Saúde Ocupacional' },
  ]);

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

  readonly diasSetorOptions = computed(() => {
    const map = new Map<string, number>();
    for (const r of this.filteredData()) {
      if (r.setor) map.set(r.setor, (map.get(r.setor) ?? 0) + r.diasPerdidos);
    }
    const data = [...map.entries()].map(([setor, dias]) => ({ setor, dias }));
    return {
      data,
      series: [{ type: 'bar' as const, xKey: 'setor', yKey: 'dias', yName: 'Dias Perdidos', fill: '#176b5b' }],
      axes: {
        bottom: { type: 'category' as const },
        left: { type: 'number' as const },
      },
      listeners: { seriesNodeClick: (e: Record<string, unknown>) => this.toggleFilter(this.filterSetor, (e['datum'] as Record<string, string>)?.['setor']) },
    } as unknown as AgChartOptions;
  });

  readonly diasCargoOptions = computed(() => {
    const map = new Map<string, number>();
    for (const r of this.filteredData()) {
      if (r.cargo) map.set(r.cargo, (map.get(r.cargo) ?? 0) + r.diasPerdidos);
    }
    const data = [...map.entries()].map(([cargo, dias]) => ({ cargo, dias }));
    return {
      data,
      series: [{ type: 'bar' as const, xKey: 'cargo', yKey: 'dias', yName: 'Dias Perdidos', fill: '#78c890' }],
      axes: {
        left: { type: 'category' as const },
        bottom: { type: 'number' as const },
      },
      listeners: { seriesNodeClick: (e: Record<string, unknown>) => this.toggleFilter(this.filterCargo, (e['datum'] as Record<string, string>)?.['cargo']) },
    } as unknown as AgChartOptions;
  });

  readonly evolucaoOptions = computed(() => {
    const map = new Map<string, number>();
    for (const r of this.filteredData()) {
      if (!r.dataInicio) continue;
      const parts = r.dataInicio.split('/');
      if (parts.length >= 2) {
        const monthKey = `${parts[0].padStart(2, '0')}/${parts[2] ?? '2025'}`;
        map.set(monthKey, (map.get(monthKey) ?? 0) + r.diasPerdidos);
      }
    }
    const data = [...map.entries()]
      .map(([mes, dias]) => ({ mes, dias }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
    return {
      data,
      series: [{ type: 'line' as const, xKey: 'mes', yKey: 'dias', yName: 'Dias Perdidos', stroke: '#176b5b', marker: { fill: '#176b5b', stroke: '#176b5b' } }],
      axes: {
        bottom: { type: 'category' as const },
        left: { type: 'number' as const },
      },
    } as unknown as AgChartOptions;
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
    this.csv.loadAbsenteeism().then((data) => this.allData.set(data));
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

  private toggleFilter(filterSignal: ReturnType<typeof signal<string>>, value: string | undefined): void {
    if (!value) return;
    filterSignal.set(filterSignal() === value ? '' : value);
  }
}
