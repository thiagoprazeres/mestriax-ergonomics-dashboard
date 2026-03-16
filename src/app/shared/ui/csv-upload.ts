import { Component, ChangeDetectionStrategy, input, output, signal, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-csv-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors"
      [class.border-gray-300]="!isDragging()"
      [class.bg-gray-50]="!isDragging()"
      [class.border-emerald-400]="isDragging()"
      [class.bg-emerald-50]="isDragging()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave()"
      (drop)="onDrop($event)"
    >
      <div class="text-4xl text-gray-300">📄</div>
      <p class="text-sm font-medium text-gray-600">{{ label() }}</p>
      <p class="text-xs text-gray-400">Arraste um arquivo .csv ou clique para selecionar</p>
      <button
        type="button"
        class="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        (click)="openFilePicker()"
      >
        Selecionar arquivo
      </button>
      <input
        #fileInput
        type="file"
        accept=".csv"
        class="hidden"
        (change)="onFileSelect($event)"
        [attr.aria-label]="label()"
      />
      @if (error()) {
        <p class="mt-2 text-sm text-red-500" role="alert">{{ error() }}</p>
      }
      @if (success()) {
        <p class="mt-2 text-sm text-emerald-600" role="status">{{ success() }}</p>
      }
    </div>
  `,
})
export class CsvUpload {
  label = input('Importar CSV');
  accept = input('.csv');

  fileSelected = output<File>();

  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  readonly isDragging = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
    input.value = '';
  }

  private processFile(file: File): void {
    this.error.set('');
    this.success.set('');
    if (!file.name.endsWith('.csv')) {
      this.error.set('Apenas arquivos .csv são aceitos.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.error.set('O arquivo excede o limite de 10 MB.');
      return;
    }
    this.fileSelected.emit(file);
  }

  setSuccess(msg: string): void {
    this.success.set(msg);
    this.error.set('');
  }

  setError(msg: string): void {
    this.error.set(msg);
    this.success.set('');
  }
}
