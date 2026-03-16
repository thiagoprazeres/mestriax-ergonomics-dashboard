import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from '../../shared/layout/breadcrumb';
import { KpiCard } from '../../shared/ui/kpi-card';
import { ChartCard } from '../../shared/ui/chart-card';
import { DataGridCard } from '../../shared/ui/data-grid-card';
import { FilterBar, FilterOption } from '../../shared/ui/filter-bar';
import { CsvService } from '../../shared/services/csv.service';
import { MockDataService } from '../../shared/services/mock-data.service';
import { AepRecord } from '../../shared/models/aep.model';
import type { AgChartOptions } from 'ag-charts-community';
import type { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-ergonomics-diagnosis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, KpiCard, ChartCard, DataGridCard, FilterBar],
  template: `
    <app-breadcrumb [items]="breadcrumbs()" />
    <h1 class="mb-1 text-2xl font-bold text-gray-800">Diagnóstico Ergonômico</h1>
    <p class="mb-6 text-sm text-gray-400">Análise Ergonômica Preliminar — {{ unitName() }}</p>

    <app-filter-bar
      [filters]="filterOptions()"
      (filterChange)="onFilterChange($event)"
      (clearAll)="clearFilters()"
    />

    <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <app-kpi-card label="Total de avaliações" [value]="totalAvaliacoes()" />
      <app-kpi-card label="Setores avaliados" [value]="setoresAvaliados()" />
      <app-kpi-card label="Risco alto" [value]="riscoAlto()" />
      <app-kpi-card label="Planos de ação abertos" [value]="planosAbertos()" />
    </div>

    <div class="mb-6 grid gap-4 lg:grid-cols-2">
      <app-chart-card title="Classificação de Risco" [options]="classifPieOptions()"
        [activeFilter]="filterClassificacao()" [clearFilter]="clearClassificacao" />
      <app-chart-card title="Classificação por Cargo" [options]="classifCargoOptions()"
        [activeFilter]="filterCargo()" [clearFilter]="clearCargo" />
    </div>
    <div class="mb-6 grid gap-4 lg:grid-cols-2">
      <app-chart-card title="Classificação por Setor" [options]="classifSetorOptions()"
        [activeFilter]="filterSetor()" [clearFilter]="clearSetor" />
      <app-chart-card title="Evolução do Risco Ergonômico" [options]="evolucaoRiscoOptions()" />
    </div>

    <app-data-grid-card title="Detalhamento AEP" [rowData]="filteredData()" [columnDefs]="columns" />
  `,
})
export class ErgonomicsDiagnosis implements OnInit {
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
    { label: 'Diagnóstico Ergonômico' },
  ]);

  readonly allData = signal<AepRecord[]>([]);
  readonly filterClassificacao = signal('');
  readonly filterSetor = signal('');
  readonly filterCargo = signal('');
  readonly filterGrupoRisco = signal('');

  readonly clearClassificacao = () => this.filterClassificacao.set('');
  readonly clearSetor = () => this.filterSetor.set('');
  readonly clearCargo = () => this.filterCargo.set('');

  readonly filteredData = computed(() => {
    let data = this.allData();
    const cls = this.filterClassificacao();
    const setor = this.filterSetor();
    const cargo = this.filterCargo();
    const grupo = this.filterGrupoRisco();
    if (cls) data = data.filter((r) => r.classificacao === cls);
    if (setor) data = data.filter((r) => r.setor === setor);
    if (cargo) data = data.filter((r) => r.cargo === cargo);
    if (grupo) data = data.filter((r) => r.grupoRisco === grupo);
    return data;
  });

  readonly setores = computed(() => [...new Set(this.allData().map((r) => r.setor).filter(Boolean))].sort());
  readonly classificacoes = computed(() => [...new Set(this.allData().map((r) => r.classificacao).filter(Boolean))].sort());
  readonly gruposRisco = computed(() => [...new Set(this.allData().map((r) => r.grupoRisco).filter(Boolean))].sort());

  readonly filterOptions = computed<FilterOption[]>(() => [
    { label: 'Classificação', key: 'classificacao', options: this.classificacoes(), selected: this.filterClassificacao() },
    { label: 'Setor', key: 'setor', options: this.setores(), selected: this.filterSetor() },
    { label: 'Grupo de Risco', key: 'grupoRisco', options: this.gruposRisco(), selected: this.filterGrupoRisco() },
  ]);

  readonly totalAvaliacoes = computed(() => this.filteredData().length);
  readonly setoresAvaliados = computed(() => new Set(this.filteredData().map((r) => r.setor).filter(Boolean)).size);
  readonly riscoAlto = computed(() => this.filteredData().filter((r) => r.classificacao === 'Alto' || r.classificacao === 'Muito Alta').length);
  readonly planosAbertos = computed(() => this.filteredData().filter((r) => r.planoAcao && r.status !== 'Concluído').length);

  private readonly COLORS = ['#176b5b', '#78c890', '#f59e0b', '#ef4444', '#6366f1'];

  readonly classifPieOptions = computed(() => {
    const counts = this.countBy(this.filteredData(), 'classificacao');
    return {
      data: counts,
      series: [{ type: 'pie' as const, angleKey: 'count', legendItemKey: 'label', fills: this.COLORS }],
      legend: { position: 'bottom' as const },
      listeners: { seriesNodeClick: (e: Record<string, unknown>) => this.toggleFilter(this.filterClassificacao, (e['datum'] as Record<string, string>)?.['label']) },
    } as unknown as AgChartOptions;
  });

  readonly classifCargoOptions = computed(() => {
    const data = this.filteredData();
    const cargos = [...new Set(data.map((r) => r.cargo).filter(Boolean))];
    const barData = cargos.map((cargo) => {
      const rows = data.filter((r) => r.cargo === cargo);
      return { cargo, alto: rows.filter((r) => r.classificacao === 'Alto' || r.classificacao === 'Muito Alta').length, moderado: rows.filter((r) => r.classificacao === 'Moderado').length, baixo: rows.filter((r) => r.classificacao === 'Baixo' || r.classificacao === 'Muito Baixa').length };
    }).sort((a, b) => (b.alto + b.moderado + b.baixo) - (a.alto + a.moderado + a.baixo)).slice(0, 10);
    return {
      data: barData,
      series: [
        { type: 'bar' as const, xKey: 'cargo', yKey: 'alto', yName: 'Alto', fill: '#ef4444' },
        { type: 'bar' as const, xKey: 'cargo', yKey: 'moderado', yName: 'Moderado', fill: '#f59e0b' },
        { type: 'bar' as const, xKey: 'cargo', yKey: 'baixo', yName: 'Baixo', fill: '#78c890' },
      ],
      axes: {
        left: { type: 'category' as const },
        bottom: { type: 'number' as const },
      },
      legend: { position: 'bottom' as const },
      listeners: { seriesNodeClick: (e: Record<string, unknown>) => this.toggleFilter(this.filterCargo, (e['datum'] as Record<string, string>)?.['cargo']) },
    } as unknown as AgChartOptions;
  });

  readonly classifSetorOptions = computed(() => {
    const data = this.filteredData();
    const setores = [...new Set(data.map((r) => r.setor).filter(Boolean))];
    const barData = setores.map((setor) => {
      const rows = data.filter((r) => r.setor === setor);
      return { setor, alto: rows.filter((r) => r.classificacao === 'Alto' || r.classificacao === 'Muito Alta').length, moderado: rows.filter((r) => r.classificacao === 'Moderado').length, baixo: rows.filter((r) => r.classificacao === 'Baixo' || r.classificacao === 'Muito Baixa').length };
    });
    return {
      data: barData,
      series: [
        { type: 'bar' as const, xKey: 'setor', yKey: 'alto', yName: 'Alto', fill: '#ef4444' },
        { type: 'bar' as const, xKey: 'setor', yKey: 'moderado', yName: 'Moderado', fill: '#f59e0b' },
        { type: 'bar' as const, xKey: 'setor', yKey: 'baixo', yName: 'Baixo', fill: '#78c890' },
      ],
      axes: {
        left: { type: 'category' as const },
        bottom: { type: 'number' as const },
      },
      legend: { position: 'bottom' as const },
      listeners: { seriesNodeClick: (e: Record<string, unknown>) => this.toggleFilter(this.filterSetor, (e['datum'] as Record<string, string>)?.['setor']) },
    } as unknown as AgChartOptions;
  });

  readonly evolucaoRiscoOptions = computed(() => {
    const data = this.filteredData();
    const monthMap = new Map<string, { baixa: number; moderada: number; alta: number }>();
    for (const r of data) {
      if (!r.data) continue;
      const parts = r.data.split('/');
      if (parts.length < 3) continue;
      const key = `${parts[1].padStart(2, '0')}/${parts[2]}`;
      const entry = monthMap.get(key) ?? { baixa: 0, moderada: 0, alta: 0 };
      const cls = r.classificacao;
      if (cls === 'Baixo' || cls === 'Muito Baixa') entry.baixa++;
      else if (cls === 'Moderado') entry.moderada++;
      else if (cls === 'Alto' || cls === 'Muito Alta') entry.alta++;
      monthMap.set(key, entry);
    }
    const chartData = [...monthMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mes, v]) => ({ mes, ...v }));
    return {
      data: chartData,
      series: [
        { type: 'line' as const, xKey: 'mes', yKey: 'baixa', yName: 'Baixa', stroke: '#78c890', marker: { fill: '#78c890', stroke: '#78c890' } },
        { type: 'line' as const, xKey: 'mes', yKey: 'moderada', yName: 'Moderada', stroke: '#f59e0b', marker: { fill: '#f59e0b', stroke: '#f59e0b' } },
        { type: 'line' as const, xKey: 'mes', yKey: 'alta', yName: 'Alta', stroke: '#ef4444', marker: { fill: '#ef4444', stroke: '#ef4444' } },
      ],
      axes: {
        bottom: { type: 'category' as const },
        left: { type: 'number' as const },
      },
      legend: { position: 'bottom' as const },
    } as unknown as AgChartOptions;
  });

  readonly columns: ColDef[] = [
    { field: 'setor', headerName: 'Setor' },
    { field: 'cargo', headerName: 'Cargo' },
    { field: 'classificacao', headerName: 'Classificação' },
    { field: 'grupoRisco', headerName: 'Grupo de Risco' },
    { field: 'subGrupoRisco', headerName: 'Subgrupo de Risco' },
    { field: 'planoAcao', headerName: 'Plano de Ação', flex: 2 },
    { field: 'status', headerName: 'Status' },
  ];

  ngOnInit(): void {
    this.csv.loadAep().then((data) => this.allData.set(data));
  }

  onFilterChange(event: { key: string; value: string }): void {
    if (event.key === 'classificacao') this.filterClassificacao.set(event.value);
    if (event.key === 'setor') this.filterSetor.set(event.value);
    if (event.key === 'cargo') this.filterCargo.set(event.value);
    if (event.key === 'grupoRisco') this.filterGrupoRisco.set(event.value);
  }

  clearFilters(): void {
    this.filterClassificacao.set('');
    this.filterSetor.set('');
    this.filterCargo.set('');
    this.filterGrupoRisco.set('');
  }

  private toggleFilter(filterSignal: ReturnType<typeof signal<string>>, value: string | undefined): void {
    if (!value) return;
    filterSignal.set(filterSignal() === value ? '' : value);
  }

  private countBy(data: AepRecord[], key: keyof AepRecord): { label: string; count: number }[] {
    const map = new Map<string, number>();
    for (const row of data) {
      const val = String(row[key] ?? '').trim();
      if (val) map.set(val, (map.get(val) ?? 0) + 1);
    }
    return [...map.entries()].map(([label, count]) => ({ label, count }));
  }
}
