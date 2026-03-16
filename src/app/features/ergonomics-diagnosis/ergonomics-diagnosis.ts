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
import type { EChartsOption } from 'echarts';
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
        [activeFilter]="filterClassificacao()" [clearFilter]="clearClassificacao"
        (chartClick)="onPieClick($event, filterClassificacao)" />
      <app-chart-card title="Classificação por Cargo" [options]="classifCargoOptions()"
        [activeFilter]="filterCargo()" [clearFilter]="clearCargo"
        (chartClick)="onBarClick($event, 'cargo', filterCargo)" />
    </div>
    <div class="mb-6 grid gap-4 lg:grid-cols-2">
      <app-chart-card title="Classificação por Setor" [options]="classifSetorOptions()"
        [activeFilter]="filterSetor()" [clearFilter]="clearSetor"
        (chartClick)="onBarClick($event, 'setor', filterSetor)" />
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

  private readonly COLORS: Record<string, string> = {
    'Muito Alta': '#ef4444', 'Alto': '#f59e0b', 'Moderado': '#78c890', 'Baixo': '#176b5b',
  };

  readonly classifPieOptions = computed<EChartsOption>(() => {
    const counts = this.countBy(this.filteredData(), 'classificacao');
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, type: 'scroll' },
      color: counts.map((c) => this.COLORS[c.name] ?? '#6366f1'),
      series: [{
        type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false }, emphasis: { label: { show: true, fontWeight: 'bold' } },
        data: counts,
      }],
    };
  });

  readonly classifCargoOptions = computed<EChartsOption>(() => {
    const data = this.filteredData();
    const cargos = [...new Set(data.map((r) => r.cargo).filter(Boolean))];
    const grouped = cargos.map((cargo) => {
      const rows = data.filter((r) => r.cargo === cargo);
      return {
        cargo,
        alto: rows.filter((r) => r.classificacao === 'Alto' || r.classificacao === 'Muito Alta').length,
        moderado: rows.filter((r) => r.classificacao === 'Moderado').length,
        baixo: rows.filter((r) => r.classificacao === 'Baixo' || r.classificacao === 'Muito Baixa').length,
      };
    }).sort((a, b) => (b.alto + b.moderado + b.baixo) - (a.alto + a.moderado + a.baixo)).slice(0, 10);
    const labels = grouped.map((g) => g.cargo);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { bottom: 0, type: 'scroll' },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      yAxis: { type: 'category', data: labels },
      xAxis: { type: 'value' },
      series: [
        { name: 'Alto', type: 'bar', stack: 'total', data: grouped.map((g) => g.alto), itemStyle: { color: '#ef4444' } },
        { name: 'Moderado', type: 'bar', stack: 'total', data: grouped.map((g) => g.moderado), itemStyle: { color: '#f59e0b' } },
        { name: 'Baixo', type: 'bar', stack: 'total', data: grouped.map((g) => g.baixo), itemStyle: { color: '#78c890' } },
      ],
    };
  });

  readonly classifSetorOptions = computed<EChartsOption>(() => {
    const data = this.filteredData();
    const setores = [...new Set(data.map((r) => r.setor).filter(Boolean))];
    const grouped = setores.map((setor) => {
      const rows = data.filter((r) => r.setor === setor);
      return {
        setor,
        alto: rows.filter((r) => r.classificacao === 'Alto' || r.classificacao === 'Muito Alta').length,
        moderado: rows.filter((r) => r.classificacao === 'Moderado').length,
        baixo: rows.filter((r) => r.classificacao === 'Baixo' || r.classificacao === 'Muito Baixa').length,
      };
    });
    const labels = grouped.map((g) => g.setor);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { bottom: 0, type: 'scroll' },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      yAxis: { type: 'category', data: labels },
      xAxis: { type: 'value' },
      series: [
        { name: 'Alto', type: 'bar', stack: 'total', data: grouped.map((g) => g.alto), itemStyle: { color: '#ef4444' } },
        { name: 'Moderado', type: 'bar', stack: 'total', data: grouped.map((g) => g.moderado), itemStyle: { color: '#f59e0b' } },
        { name: 'Baixo', type: 'bar', stack: 'total', data: grouped.map((g) => g.baixo), itemStyle: { color: '#78c890' } },
      ],
    };
  });

  readonly evolucaoRiscoOptions = computed<EChartsOption>(() => {
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
    const sorted = [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const months = sorted.map(([m]) => m);
    return {
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, type: 'scroll' },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: { type: 'category', data: months, boundaryGap: false },
      yAxis: { type: 'value' },
      series: [
        { name: 'Baixa', type: 'line', data: sorted.map(([, v]) => v.baixa), smooth: true, itemStyle: { color: '#78c890' }, areaStyle: { opacity: 0.1 } },
        { name: 'Moderada', type: 'line', data: sorted.map(([, v]) => v.moderada), smooth: true, itemStyle: { color: '#f59e0b' }, areaStyle: { opacity: 0.1 } },
        { name: 'Alta', type: 'line', data: sorted.map(([, v]) => v.alta), smooth: true, itemStyle: { color: '#ef4444' }, areaStyle: { opacity: 0.1 } },
      ],
    };
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

  onPieClick(event: Record<string, unknown>, filterSignal: ReturnType<typeof signal<string>>): void {
    const name = event['name'] as string | undefined;
    if (!name) return;
    filterSignal.set(filterSignal() === name ? '' : name);
  }

  onBarClick(event: Record<string, unknown>, _key: string, filterSignal: ReturnType<typeof signal<string>>): void {
    const name = event['name'] as string | undefined;
    if (!name) return;
    filterSignal.set(filterSignal() === name ? '' : name);
  }

  private countBy(data: AepRecord[], key: keyof AepRecord): { name: string; value: number }[] {
    const map = new Map<string, number>();
    for (const row of data) {
      const val = String(row[key] ?? '').trim();
      if (val) map.set(val, (map.get(val) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }
}
