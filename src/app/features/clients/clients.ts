import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Building2, Pencil, Trash2, Plus, X, Check } from 'lucide-angular';
import { Breadcrumb } from '../../shared/layout/breadcrumb';
import { ClientService } from '../../shared/services/client.service';
import type { StoredClient } from '../../shared/services/db.service';

@Component({
  selector: 'app-clients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, FormsModule, LucideAngularModule],
  template: `
    <app-breadcrumb [items]="breadcrumbs" />
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800 sm:text-2xl dark:text-gray-100">Clientes</h1>
        <p class="text-sm text-gray-400 dark:text-gray-500">Selecione um cliente para gerenciar</p>
      </div>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:w-auto"
        (click)="showAddForm.set(true)"
      >
        <lucide-icon [img]="PlusIcon" [size]="16" />
        Novo cliente
      </button>
    </div>

    @if (showAddForm()) {
      <div class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-700 dark:bg-emerald-900/20">
        <h3 class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Novo cliente</h3>
        <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div class="flex flex-1 flex-col gap-1" style="min-width: 160px">
            <label for="new-name" class="text-xs font-medium text-gray-600 dark:text-gray-400">Nome</label>
            <input id="new-name" type="text" [(ngModel)]="newName"
              placeholder="Ex: Amazon Brasil"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div class="flex flex-1 flex-col gap-1" style="min-width: 160px">
            <label for="new-slug" class="text-xs font-medium text-gray-600 dark:text-gray-400">Slug (URL)</label>
            <input id="new-slug" type="text" [(ngModel)]="newSlug"
              placeholder="Ex: amazon-brasil"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div class="flex flex-1 flex-col gap-1" style="min-width: 220px">
            <label for="new-logo" class="text-xs font-medium text-gray-600 dark:text-gray-400">Logo URL (opcional)</label>
            <input id="new-logo" type="url" [(ngModel)]="newLogoUrl"
              placeholder="https://cdn.brandfetch.io/.../logo.svg"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div class="flex items-end gap-2">
            <button type="button"
              class="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              [disabled]="!newName.trim() || !newSlug.trim()"
              (click)="addClient()">
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
      @for (client of clientService.clients(); track client.id) {
        <div class="group relative flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-primary-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-400">
          @if (editingId() === client.id) {
            <div class="flex flex-col gap-2">
              <input type="text" [(ngModel)]="editName" placeholder="Nome"
                class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
              <input type="url" [(ngModel)]="editLogoUrl" placeholder="Logo URL (opcional)"
                class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
              <div class="flex gap-2">
                <button type="button"
                  class="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                  (click)="saveEdit(client)">
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
            <button type="button" class="flex items-center gap-4 text-left" (click)="onSelect(client.slug)">
              @if (client.logoUrl) {
                <img [src]="client.logoUrl" [alt]="client.name" width="48" height="48" class="rounded-lg" />
              } @else {
                <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
                  <lucide-icon [img]="BuildingIcon" [size]="24" class="text-primary-500 dark:text-primary-300" />
                </div>
              }
              <div class="flex flex-col gap-0.5">
                <span class="text-base font-semibold text-gray-800 transition-colors group-hover:text-primary-500 dark:text-gray-100">{{ client.name }}</span>
                <span class="text-sm text-gray-400 dark:text-gray-500">Gestão de Risco Ergonômico</span>
              </div>
            </button>
            <div class="absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button type="button" aria-label="Editar cliente"
                class="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                (click)="startEdit(client); $event.stopPropagation()">
                <lucide-icon [img]="PencilIcon" [size]="14" />
              </button>
              <button type="button" aria-label="Excluir cliente"
                class="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                (click)="deleteClient(client); $event.stopPropagation()">
                <lucide-icon [img]="TrashIcon" [size]="14" />
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class Clients {
  readonly clientService = inject(ClientService);
  private readonly router = inject(Router);

  readonly breadcrumbs = [
    { label: 'Início', route: '/clientes' },
    { label: 'Clientes' },
  ];

  readonly BuildingIcon = Building2;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly CheckIcon = Check;

  readonly showAddForm = signal(false);
  readonly editingId = signal(0);

  protected newName = '';
  protected newSlug = '';
  protected newLogoUrl = '';
  protected editName = '';
  protected editLogoUrl = '';

  onSelect(slug: string): void {
    this.router.navigate(['/clientes', slug, 'unidades']);
  }

  async addClient(): Promise<void> {
    const name = this.newName.trim();
    const slug = this.newSlug.trim();
    if (!name || !slug) return;
    await this.clientService.addClient({ name, slug, logoUrl: this.newLogoUrl.trim() || undefined });
    this.newName = '';
    this.newSlug = '';
    this.newLogoUrl = '';
    this.showAddForm.set(false);
  }

  cancelAdd(): void {
    this.newName = '';
    this.newSlug = '';
    this.newLogoUrl = '';
    this.showAddForm.set(false);
  }

  startEdit(client: StoredClient): void {
    this.editingId.set(client.id);
    this.editName = client.name;
    this.editLogoUrl = client.logoUrl ?? '';
  }

  async saveEdit(client: StoredClient): Promise<void> {
    const name = this.editName.trim();
    if (!name) return;
    await this.clientService.updateClient({ ...client, name, logoUrl: this.editLogoUrl.trim() || undefined });
    this.editingId.set(0);
  }

  async deleteClient(client: StoredClient): Promise<void> {
    if (!confirm(`Excluir o cliente "${client.name}" e todas as suas unidades?`)) return;
    await this.clientService.deleteClient(client);
  }
}
