import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from '../../shared/layout/breadcrumb';
import { CsvUpload } from '../../shared/ui/csv-upload';
import { ClientService } from '../../shared/services/client.service';
import { DataService } from '../../shared/services/data.service';
import type { StoredAepRecord, StoredAbsenteeismRecord } from '../../shared/services/db.service';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry, type ColDef, type CellValueChangedEvent, type GridApi } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

type ActiveTab = 'aep' | 'absenteeism';

@Component({
  selector: 'app-data-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, CsvUpload, AgGridAngular],
  template: `
    <app-breadcrumb [items]="breadcrumbs()" />
    <h1 class="mb-1 text-2xl font-bold text-gray-800">Gestão de Dados</h1>
    <p class="mb-6 text-sm text-gray-400">Importar, editar e exportar dados — {{ unitName() }}</p>

    <!-- Tabs -->
    <div class="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1" role="tablist">
      <button type="button" role="tab"
        class="flex-1 rounded-md px-4 py-2 text-sm font-medium transition"
        [class.bg-white]="activeTab() === 'aep'"
        [class.shadow-sm]="activeTab() === 'aep'"
        [class.text-emerald-700]="activeTab() === 'aep'"
        [class.text-gray-500]="activeTab() !== 'aep'"
        [attr.aria-selected]="activeTab() === 'aep'"
        (click)="activeTab.set('aep')"
      >
        AEP ({{ aepCount() }} registros)
      </button>
      <button type="button" role="tab"
        class="flex-1 rounded-md px-4 py-2 text-sm font-medium transition"
        [class.bg-white]="activeTab() === 'absenteeism'"
        [class.shadow-sm]="activeTab() === 'absenteeism'"
        [class.text-emerald-700]="activeTab() === 'absenteeism'"
        [class.text-gray-500]="activeTab() !== 'absenteeism'"
        [attr.aria-selected]="activeTab() === 'absenteeism'"
        (click)="activeTab.set('absenteeism')"
      >
        Absenteísmo ({{ absenteeismCount() }} registros)
      </button>
    </div>

    <!-- Import -->
    @if (activeTab() === 'aep') {
      <div class="mb-6">
        <app-csv-upload #aepUpload label="Importar CSV — Análise Ergonômica Preliminar (AEP)"
          (fileSelected)="onImportAep($event)" />
      </div>
    } @else {
      <div class="mb-6">
        <app-csv-upload #absUpload label="Importar CSV — Absenteísmo Osteomuscular"
          (fileSelected)="onImportAbsenteeism($event)" />
      </div>
    }

    <!-- Action Buttons -->
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <button type="button"
        class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        (click)="addRow()"
      >
        + Novo registro
      </button>
      <button type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        (click)="exportCsv()"
      >
        Exportar CSV
      </button>
      @if (selectedIds().length > 0) {
        <button type="button"
          class="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:outline-none"
          (click)="deleteSelected()"
        >
          Excluir selecionados ({{ selectedIds().length }})
        </button>
      }
      <button type="button"
        class="ml-auto rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:outline-none"
        (click)="clearAll()"
      >
        Limpar tudo
      </button>
    </div>

    <!-- Grid -->
    @if (activeTab() === 'aep') {
      <div class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div class="h-[500px] w-full">
          <ag-grid-angular
            class="ag-theme-alpine h-full w-full"
            [rowData]="aepRows()"
            [columnDefs]="aepColDefs"
            [defaultColDef]="defaultColDef"
            [pagination]="true"
            [paginationPageSize]="20"
            [paginationPageSizeSelector]="[10, 20, 50, 100]"
            [rowSelection]="rowSelection"
            [animateRows]="true"
            (cellValueChanged)="onAepCellChanged($event)"
            (selectionChanged)="onSelectionChanged($event)"
            (gridReady)="onGridReady($event)"
          />
        </div>
      </div>
    } @else {
      <div class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div class="h-[500px] w-full">
          <ag-grid-angular
            class="ag-theme-alpine h-full w-full"
            [rowData]="absenteeismRows()"
            [columnDefs]="absColDefs"
            [defaultColDef]="defaultColDef"
            [pagination]="true"
            [paginationPageSize]="20"
            [paginationPageSizeSelector]="[10, 20, 50, 100]"
            [rowSelection]="rowSelection"
            [animateRows]="true"
            (cellValueChanged)="onAbsCellChanged($event)"
            (selectionChanged)="onSelectionChanged($event)"
            (gridReady)="onGridReady($event)"
          />
        </div>
      </div>
    }

    @if (statusMsg()) {
      <div class="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
        {{ statusMsg() }}
      </div>
    }
  `,
})
export class DataManagement implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly clientService = inject(ClientService);
  private readonly dataService = inject(DataService);

  private readonly clientSlug = signal(this.route.snapshot.paramMap.get('clienteId') ?? '');
  private readonly unitSlug = signal(this.route.snapshot.paramMap.get('unidadeId') ?? '');

  readonly clientName = computed(() => this.clientService.getClient(this.clientSlug())?.name ?? this.clientSlug());
  readonly unitName = computed(() => this.clientService.getUnit(this.clientSlug(), this.unitSlug())?.name ?? this.unitSlug());

  readonly breadcrumbs = computed(() => [
    { label: 'Clientes', route: '/clientes' },
    { label: this.clientName(), route: `/clientes/${this.clientSlug()}/unidades` },
    { label: this.unitName(), route: `/clientes/${this.clientSlug()}/unidades/${this.unitSlug()}/dashboard` },
    { label: 'Gestão de Dados' },
  ]);

  readonly activeTab = signal<ActiveTab>('aep');
  readonly statusMsg = signal('');
  readonly selectedIds = signal<number[]>([]);
  private gridApi: GridApi | null = null;

  readonly aepUpload = viewChild<CsvUpload>('aepUpload');
  readonly absUpload = viewChild<CsvUpload>('absUpload');

  readonly aepRows = this.dataService.aepData;
  readonly absenteeismRows = this.dataService.absenteeismData;
  readonly aepCount = this.dataService.aepCount;
  readonly absenteeismCount = this.dataService.absenteeismCount;

  readonly rowSelection = { mode: 'multiRow' as const };

  readonly defaultColDef: ColDef = {
    sortable: true, filter: true, resizable: true, editable: true, flex: 1, minWidth: 100,
  };

  readonly aepColDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', editable: false, maxWidth: 80 },
    { field: 'data', headerName: 'Data' },
    { field: 'setor', headerName: 'Setor' },
    { field: 'cargo', headerName: 'Cargo' },
    { field: 'classificacao', headerName: 'Classificação' },
    { field: 'grupoRisco', headerName: 'Grupo de Risco' },
    { field: 'subGrupoRisco', headerName: 'Subgrupo' },
    { field: 'probabilidade', headerName: 'Prob.', maxWidth: 90 },
    { field: 'severidade', headerName: 'Sev.', maxWidth: 90 },
    { field: 'nivelRisco', headerName: 'Nível', maxWidth: 90 },
    { field: 'planoAcao', headerName: 'Plano de Ação', flex: 2 },
    { field: 'responsavel', headerName: 'Responsável' },
    { field: 'prazo', headerName: 'Prazo' },
    { field: 'status', headerName: 'Status' },
  ];

  readonly absColDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', editable: false, maxWidth: 80 },
    { field: 'matricula', headerName: 'Matrícula' },
    { field: 'cargo', headerName: 'Cargo' },
    { field: 'setor', headerName: 'Setor' },
    { field: 'cid', headerName: 'CID' },
    { field: 'dataInicio', headerName: 'Data Início' },
    { field: 'retorno', headerName: 'Retorno' },
    { field: 'diasPerdidos', headerName: 'Dias Perdidos' },
  ];

  ngOnInit(): void {
    this.dataService.loadAep();
    this.dataService.loadAbsenteeism();
  }

  onGridReady(params: { api: GridApi }): void {
    this.gridApi = params.api;
  }

  // ── Import ──

  async onImportAep(file: File): Promise<void> {
    try {
      const count = await this.dataService.importAepCsv(file);
      this.showStatus(`${count} registros AEP importados com sucesso.`);
      this.aepUpload()?.setSuccess(`${count} registros importados.`);
    } catch {
      this.aepUpload()?.setError('Erro ao importar o arquivo. Verifique o formato.');
    }
  }

  async onImportAbsenteeism(file: File): Promise<void> {
    try {
      const count = await this.dataService.importAbsenteeismCsv(file);
      this.showStatus(`${count} registros de absenteísmo importados com sucesso.`);
      this.absUpload()?.setSuccess(`${count} registros importados.`);
    } catch {
      this.absUpload()?.setError('Erro ao importar o arquivo. Verifique o formato.');
    }
  }

  // ── CRUD ──

  async onAepCellChanged(event: CellValueChangedEvent): Promise<void> {
    const row = event.data as StoredAepRecord;
    if (row.id) {
      await this.dataService.updateAepRecord(row);
    }
  }

  async onAbsCellChanged(event: CellValueChangedEvent): Promise<void> {
    const row = event.data as StoredAbsenteeismRecord;
    if (row.id) {
      await this.dataService.updateAbsenteeismRecord(row);
    }
  }

  async addRow(): Promise<void> {
    if (this.activeTab() === 'aep') {
      await this.dataService.addAepRecord({
        data: '', unidade: '', setor: '', cargo: '', caracterizacaoAtividade: '',
        fonteGeradora: '', grupoRisco: '', subGrupoRisco: '', percentualExposicao: '',
        medidasControle: '', probabilidade: 0, severidade: 0, nivelRisco: 0,
        classificacao: '', avaliacaoAmbiental: '', planoAcao: '', responsavel: '',
        prazo: '', status: '',
      });
      this.showStatus('Novo registro AEP adicionado.');
    } else {
      await this.dataService.addAbsenteeismRecord({
        matricula: '', cargo: '', setor: '', cid: '', dataInicio: '', retorno: '', diasPerdidos: 0,
      });
      this.showStatus('Novo registro de absenteísmo adicionado.');
    }
  }

  async deleteSelected(): Promise<void> {
    const ids = this.selectedIds();
    if (ids.length === 0) return;
    if (this.activeTab() === 'aep') {
      for (const id of ids) await this.dataService.deleteAepRecord(id);
    } else {
      for (const id of ids) await this.dataService.deleteAbsenteeismRecord(id);
    }
    this.selectedIds.set([]);
    this.showStatus(`${ids.length} registro(s) excluído(s).`);
  }

  async clearAll(): Promise<void> {
    if (this.activeTab() === 'aep') {
      await this.dataService.clearAep();
      this.showStatus('Todos os registros AEP foram removidos.');
    } else {
      await this.dataService.clearAbsenteeism();
      this.showStatus('Todos os registros de absenteísmo foram removidos.');
    }
  }

  onSelectionChanged(event: { api: GridApi }): void {
    const rows = event.api.getSelectedRows() as Array<{ id?: number }>;
    this.selectedIds.set(rows.filter((r) => r.id != null).map((r) => r.id!));
  }

  // ── Export ──

  exportCsv(): void {
    const csv = this.activeTab() === 'aep'
      ? this.dataService.exportAepCsv()
      : this.dataService.exportAbsenteeismCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.activeTab()}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.showStatus('CSV exportado com sucesso.');
  }

  private showStatus(msg: string): void {
    this.statusMsg.set(msg);
    setTimeout(() => this.statusMsg.set(''), 4000);
  }
}
