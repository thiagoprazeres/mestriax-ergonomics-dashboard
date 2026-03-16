import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry, type ColDef, type GridOptions } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-data-grid-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular],
  template: `
    <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 class="mb-3 text-sm font-semibold text-gray-700">{{ title() }}</h3>
      <div class="h-96 w-full">
        <ag-grid-angular
          class="ag-theme-alpine h-full w-full"
          [rowData]="rowData()"
          [columnDefs]="columnDefs()"
          [defaultColDef]="defaultColDef"
          [pagination]="true"
          [paginationPageSize]="15"
          [paginationPageSizeSelector]="[10, 15, 25, 50]"
          [animateRows]="true"
        />
      </div>
    </div>
  `,
})
export class DataGridCard {
  title = input.required<string>();
  rowData = input.required<unknown[]>();
  columnDefs = input.required<ColDef[]>();

  readonly defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 120,
  };
}
