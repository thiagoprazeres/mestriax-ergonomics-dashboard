import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, viewChild } from '@angular/core';
import { Breadcrumb } from '../../shared/layout/breadcrumb';
import { CsvUpload } from '../../shared/ui/csv-upload';
import { DataService } from '../../shared/services/data.service';
import { DbService, type StoredAepRecord, type StoredAbsenteeismRecord } from '../../shared/services/db.service';
import { useDashboardContext } from '../../shared/utils/dashboard-context';
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
    <p class="mb-6 text-sm text-gray-400">Importar, editar e exportar dados — {{ ctx.unitName() }}</p>

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
    <div class="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
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
      <button type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        (click)="exportBackup()"
      >
        Backup JSON
      </button>
      <label
        class="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus-within:ring-2 focus-within:ring-emerald-500"
      >
        Restaurar JSON
        <input type="file" accept=".json" class="sr-only" (change)="importBackup($event)" />
      </label>
      @if (selectedIds().length > 0) {
        <button type="button"
          class="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:outline-none"
          (click)="confirmDeleteSelected()"
        >
          Excluir selecionados ({{ selectedIds().length }})
        </button>
      }
      <button type="button"
        class="col-span-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:outline-none sm:col-span-1 sm:ml-auto"
        (click)="confirmClearAll()"
      >
        Limpar tudo
      </button>
    </div>

    <!-- Grid -->
    @if (activeTab() === 'aep') {
      <div class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div class="h-[350px] w-full sm:h-[500px]">
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
        <div class="h-[350px] w-full sm:h-[500px]">
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
  private readonly dataService = inject(DataService);
  private readonly dbService = inject(DbService);
  readonly ctx = useDashboardContext();
  readonly breadcrumbs = this.ctx.breadcrumbs('Gestão de Dados');

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

  confirmDeleteSelected(): void {
    const ids = this.selectedIds();
    if (ids.length === 0) return;
    if (!confirm(`Deseja excluir ${ids.length} registro(s)? Esta ação não pode ser desfeita.`)) return;
    this.deleteSelected();
  }

  private async deleteSelected(): Promise<void> {
    const ids = this.selectedIds();
    if (this.activeTab() === 'aep') {
      for (const id of ids) await this.dataService.deleteAepRecord(id);
    } else {
      for (const id of ids) await this.dataService.deleteAbsenteeismRecord(id);
    }
    this.selectedIds.set([]);
    this.showStatus(`${ids.length} registro(s) excluído(s).`);
  }

  confirmClearAll(): void {
    const label = this.activeTab() === 'aep' ? 'AEP' : 'Absenteísmo';
    if (!confirm(`Deseja remover TODOS os registros de ${label}? Esta ação não pode ser desfeita.`)) return;
    this.clearAll();
  }

  private async clearAll(): Promise<void> {
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

  // ── Backup / Restore ──

  async exportBackup(): Promise<void> {
    const aep = await this.dbService.getAllAep();
    const absenteeism = await this.dbService.getAllAbsenteeism();
    const payload = { version: 1, exportedAt: new Date().toISOString(), aep, absenteeism };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mestriax-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showStatus('Backup JSON exportado com sucesso.');
  }

  async importBackup(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!confirm('Restaurar backup? Os dados atuais serão substituídos.')) {
      (event.target as HTMLInputElement).value = '';
      return;
    }
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as { aep?: unknown[]; absenteeism?: unknown[] };
      if (Array.isArray(payload.aep)) {
        await this.dataService.clearAep();
        await this.dbService.bulkAddAep(payload.aep as Parameters<typeof this.dbService.bulkAddAep>[0]);
        await this.dataService.loadAep();
      }
      if (Array.isArray(payload.absenteeism)) {
        await this.dataService.clearAbsenteeism();
        await this.dbService.bulkAddAbsenteeism(payload.absenteeism as Parameters<typeof this.dbService.bulkAddAbsenteeism>[0]);
        await this.dataService.loadAbsenteeism();
      }
      this.showStatus('Backup restaurado com sucesso.');
    } catch {
      this.showStatus('Erro ao restaurar backup. Verifique o formato do arquivo.');
    }
    (event.target as HTMLInputElement).value = '';
  }

  private showStatus(msg: string): void {
    this.statusMsg.set(msg);
    setTimeout(() => this.statusMsg.set(''), 4000);
  }
}
