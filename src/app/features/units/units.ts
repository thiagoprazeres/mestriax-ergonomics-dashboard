import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MapPin, Pencil, Trash2, Plus, X, Check } from 'lucide-angular';
import { Breadcrumb } from '../../shared/layout/breadcrumb';
import { ClientService } from '../../shared/services/client.service';
import type { StoredUnit } from '../../shared/services/db.service';

@Component({
  selector: 'app-units',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, FormsModule, LucideAngularModule],
  template: `
    <app-breadcrumb [items]="breadcrumbs()" />
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        @if (clientLogo()) {
          <img [src]="clientLogo()" [alt]="clientName()" width="40" height="40" class="rounded-lg" />
        }
        <div>
          <h1 class="text-xl font-bold text-gray-800 sm:text-2xl dark:text-gray-100">Unidades — {{ clientName() }}</h1>
          <p class="text-sm text-gray-400 dark:text-gray-500">Selecione uma unidade</p>
        </div>
      </div>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:w-auto"
        (click)="showAddForm.set(true)"
      >
        <lucide-icon [img]="PlusIcon" [size]="16" />
        Nova unidade
      </button>
    </div>

    @if (showAddForm()) {
      <div class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-700 dark:bg-emerald-900/20">
        <h3 class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Nova unidade</h3>
        <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div class="flex flex-1 flex-col gap-1" style="min-width: 160px">
            <label for="new-name" class="text-xs font-medium text-gray-600 dark:text-gray-400">Nome</label>
            <input id="new-name" type="text" [(ngModel)]="newName"
              placeholder="Ex: REC3"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div class="flex flex-1 flex-col gap-1" style="min-width: 160px">
            <label for="new-slug" class="text-xs font-medium text-gray-600 dark:text-gray-400">Slug (URL)</label>
            <input id="new-slug" type="text" [(ngModel)]="newSlug"
              placeholder="Ex: rec3"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div class="flex flex-1 flex-col gap-1" style="min-width: 200px">
            <label for="new-location" class="text-xs font-medium text-gray-600 dark:text-gray-400">Localização</label>
            <input id="new-location" type="text" [(ngModel)]="newLocation"
              placeholder="Ex: Recife - PE"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div class="flex items-end gap-2">
            <button type="button"
              class="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              [disabled]="!newName.trim() || !newSlug.trim()"
              (click)="addUnit()">
              <lucide-icon [img]="CheckIcon" [size]="16" />
              Salvar
            </button>
            <button type="button"
              class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              (click)="cancelAdd()">
              <lucide-icon [img]="XIcon" [size]="16" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    }

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @for (unit of units(); track unit.id) {
        <div class="group relative flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-primary-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-400">
          @if (editingId() === unit.id) {
            <div class="flex flex-col gap-2">
              <input type="text" [(ngModel)]="editName" placeholder="Nome"
                class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
              <input type="text" [(ngModel)]="editLocation" placeholder="Localização"
                class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
              <div class="flex gap-2">
                <button type="button"
                  class="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                  (click)="saveEdit(unit)">
                  <lucide-icon [img]="CheckIcon" [size]="14" />
                  Salvar
                </button>
                <button type="button"
                  class="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  (click)="editingId.set(0)">
                  <lucide-icon [img]="XIcon" [size]="14" />
                  Cancelar
                </button>
              </div>
            </div>
          } @else {
            <button type="button" class="flex flex-col gap-2 text-left" (click)="onSelect(unit.slug)">
              <lucide-icon [img]="MapPinIcon" [size]="28" class="text-primary-500 dark:text-primary-300" />
              <span class="text-base font-semibold text-gray-800 transition-colors group-hover:text-primary-500 dark:text-gray-100">{{ unit.name }}</span>
              @if (unit.location) {
                <span class="text-sm text-gray-400 dark:text-gray-500">{{ unit.location }}</span>
              }
            </button>
            <div class="absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button type="button" aria-label="Editar unidade"
                class="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                (click)="startEdit(unit); $event.stopPropagation()">
                <lucide-icon [img]="PencilIcon" [size]="14" />
              </button>
              <button type="button" aria-label="Excluir unidade"
                class="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                (click)="deleteUnit(unit); $event.stopPropagation()">
                <lucide-icon [img]="TrashIcon" [size]="14" />
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class Units {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientService = inject(ClientService);

  private readonly clientSlug = signal(this.route.snapshot.paramMap.get('clienteId') ?? '');

  readonly clientName = computed(() => {
    const client = this.clientService.getClient(this.clientSlug());
    return client?.name ?? this.clientSlug();
  });

  readonly clientLogo = computed(() => this.clientService.getClient(this.clientSlug())?.logoUrl ?? '');

  readonly breadcrumbs = computed(() => [
    { label: 'Clientes', route: '/clientes' },
    { label: this.clientName() },
    { label: 'Unidades' },
  ]);

  readonly units = computed(() => this.clientService.getUnits(this.clientSlug()));

  readonly MapPinIcon = MapPin;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly CheckIcon = Check;

  readonly showAddForm = signal(false);
  readonly editingId = signal(0);

  protected newName = '';
  protected newSlug = '';
  protected newLocation = '';
  protected editName = '';
  protected editLocation = '';

  onSelect(slug: string): void {
    this.router.navigate(['/clientes', this.clientSlug(), 'unidades', slug, 'dashboard']);
  }

  async addUnit(): Promise<void> {
    const name = this.newName.trim();
    const slug = this.newSlug.trim();
    const location = this.newLocation.trim();
    if (!name || !slug) return;
    await this.clientService.addUnit({ name, slug, clientSlug: this.clientSlug(), location });
    this.newName = '';
    this.newSlug = '';
    this.newLocation = '';
    this.showAddForm.set(false);
  }

  cancelAdd(): void {
    this.newName = '';
    this.newSlug = '';
    this.newLocation = '';
    this.showAddForm.set(false);
  }

  startEdit(unit: StoredUnit): void {
    this.editingId.set(unit.id);
    this.editName = unit.name;
    this.editLocation = unit.location;
  }

  async saveEdit(unit: StoredUnit): Promise<void> {
    const name = this.editName.trim();
    if (!name) return;
    await this.clientService.updateUnit({ ...unit, name, location: this.editLocation.trim() });
    this.editingId.set(0);
  }

  async deleteUnit(unit: StoredUnit): Promise<void> {
    if (!confirm(`Excluir a unidade "${unit.name}"?`)) return;
    await this.clientService.deleteUnit(unit.id);
  }
}
