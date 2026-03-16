import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Pencil, Trash2, Plus, X, Check, Users, ShieldCheck } from 'lucide-angular';
import { Breadcrumb, type BreadcrumbItem } from '../../shared/layout/breadcrumb';
import { DbService, type StoredUser } from '../../shared/services/db.service';
import { AuthService } from '../../shared/services/auth.service';
import { COMPANY } from '../../shared/models/user.model';

@Component({
  selector: 'app-user-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, FormsModule, LucideAngularModule],
  template: `
    <app-breadcrumb [items]="breadcrumbs" />
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-800 sm:text-2xl dark:text-gray-100">Gerenciar Usuários</h1>
        <p class="text-sm text-gray-400 dark:text-gray-500">{{ company.name }}</p>
      </div>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:w-auto"
        (click)="showAddForm.set(true)"
      >
        <lucide-icon [img]="PlusIcon" [size]="16" />
        Novo usuário
      </button>
    </div>

    @if (showAddForm()) {
      <div class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-700 dark:bg-emerald-900/20">
        <h3 class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">Novo usuário</h3>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1">
            <label for="new-name" class="text-xs font-medium text-gray-600 dark:text-gray-400">Nome</label>
            <input id="new-name" type="text" [(ngModel)]="newName"
              placeholder="Ex: João Silva"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div class="flex flex-col gap-1">
            <label for="new-email" class="text-xs font-medium text-gray-600 dark:text-gray-400">Email</label>
            <input id="new-email" type="email" [(ngModel)]="newEmail"
              placeholder="Ex: joao@mestriax.com"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div class="flex flex-col gap-1">
            <label for="new-password" class="text-xs font-medium text-gray-600 dark:text-gray-400">Senha</label>
            <input id="new-password" type="text" [(ngModel)]="newPassword"
              placeholder="Senha de acesso"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div class="flex flex-col gap-1">
            <label for="new-role" class="text-xs font-medium text-gray-600 dark:text-gray-400">Função</label>
            <input id="new-role" type="text" [(ngModel)]="newRole"
              placeholder="Ex: Fisioterapeuta"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div class="flex flex-col gap-1 sm:col-span-2">
            <label for="new-avatar" class="text-xs font-medium text-gray-600 dark:text-gray-400">Avatar URL (opcional)</label>
            <input id="new-avatar" type="text" [(ngModel)]="newAvatarUrl"
              placeholder="Ex: avatar.webp ou https://..."
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
          </div>
          <div class="flex gap-2 sm:col-span-2">
            <button type="button"
              class="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              [disabled]="!newName.trim() || !newEmail.trim() || !newPassword.trim()"
              (click)="addUser()">
              <lucide-icon [img]="CheckIcon" [size]="16" />
              Salvar
            </button>
            <button type="button"
              class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              (click)="cancelAdd()">
              <lucide-icon [img]="XIcon" [size]="16" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    }

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @for (u of users(); track u.id) {
        <div class="group relative rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          @if (editingId() === u.id) {
            <div class="flex flex-col gap-3">
              <input type="text" [(ngModel)]="editName" placeholder="Nome"
                class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
              <input type="email" [(ngModel)]="editEmail" placeholder="Email"
                class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
              <input type="text" [(ngModel)]="editPassword" placeholder="Senha"
                class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
              <input type="text" [(ngModel)]="editRole" placeholder="Função"
                class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
              <input type="text" [(ngModel)]="editAvatarUrl" placeholder="Avatar URL"
                class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
              <div class="flex gap-2">
                <button type="button"
                  class="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                  (click)="saveEdit(u)">
                  <lucide-icon [img]="CheckIcon" [size]="14" />
                  Salvar
                </button>
                <button type="button"
                  class="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  (click)="editingId.set(0)">
                  <lucide-icon [img]="XIcon" [size]="14" />
                  Cancelar
                </button>
              </div>
            </div>
          } @else {
            <div class="flex items-start gap-4">
              @if (u.avatarUrl) {
                <img [src]="u.avatarUrl" [alt]="u.name" width="48" height="48" class="h-12 w-12 rounded-full object-cover" />
              } @else {
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                  <lucide-icon [img]="UsersIcon" [size]="20" class="text-primary-500 dark:text-primary-300" />
                </div>
              }
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ u.name }}</p>
                <p class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <lucide-icon [img]="ShieldCheckIcon" [size]="12" />
                  {{ u.role }}
                </p>
                <p class="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">{{ u.email }}</p>
              </div>
            </div>
            <div class="absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button type="button" aria-label="Editar usuário"
                class="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                (click)="startEdit(u)">
                <lucide-icon [img]="PencilIcon" [size]="14" />
              </button>
              <button type="button" aria-label="Excluir usuário"
                class="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                (click)="deleteUser(u)">
                <lucide-icon [img]="TrashIcon" [size]="14" />
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class UserManagement implements OnInit {
  private readonly db = inject(DbService);
  private readonly authService = inject(AuthService);

  readonly company = COMPANY;
  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Clientes', route: '/clientes' },
    { label: 'Usuários' },
  ];

  readonly users = signal<StoredUser[]>([]);
  readonly showAddForm = signal(false);
  readonly editingId = signal(0);

  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly XIcon = X;
  readonly CheckIcon = Check;
  readonly UsersIcon = Users;
  readonly ShieldCheckIcon = ShieldCheck;

  protected newName = '';
  protected newEmail = '';
  protected newPassword = '';
  protected newRole = '';
  protected newAvatarUrl = '';
  protected editName = '';
  protected editEmail = '';
  protected editPassword = '';
  protected editRole = '';
  protected editAvatarUrl = '';

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  private async reload(): Promise<void> {
    const all = await this.authService.loadUsers();
    this.users.set(all);
  }

  async addUser(): Promise<void> {
    const name = this.newName.trim();
    const email = this.newEmail.trim();
    const password = this.newPassword.trim();
    if (!name || !email || !password) return;
    await this.db.addUser({
      name,
      email,
      password,
      role: this.newRole.trim() || 'Usuário',
      avatarUrl: this.newAvatarUrl.trim() || undefined,
    });
    this.cancelAdd();
    await this.reload();
  }

  cancelAdd(): void {
    this.newName = '';
    this.newEmail = '';
    this.newPassword = '';
    this.newRole = '';
    this.newAvatarUrl = '';
    this.showAddForm.set(false);
  }

  startEdit(user: StoredUser): void {
    this.editingId.set(user.id);
    this.editName = user.name;
    this.editEmail = user.email;
    this.editPassword = user.password;
    this.editRole = user.role;
    this.editAvatarUrl = user.avatarUrl ?? '';
  }

  async saveEdit(user: StoredUser): Promise<void> {
    const name = this.editName.trim();
    const email = this.editEmail.trim();
    const password = this.editPassword.trim();
    if (!name || !email || !password) return;
    const updated: StoredUser = {
      ...user,
      name,
      email,
      password,
      role: this.editRole.trim() || 'Usuário',
      avatarUrl: this.editAvatarUrl.trim() || undefined,
    };
    await this.db.updateUser(updated);
    this.editingId.set(0);

    const currentUser = this.authService.currentUser();
    if (currentUser && currentUser.id === user.id) {
      this.authService.refreshUser(updated);
    }
    await this.reload();
  }

  async deleteUser(user: StoredUser): Promise<void> {
    const currentUser = this.authService.currentUser();
    if (currentUser && currentUser.id === user.id) {
      alert('Você não pode excluir seu próprio usuário.');
      return;
    }
    if (!confirm(`Excluir o usuário "${user.name}"?`)) return;
    await this.db.deleteUser(user.id);
    await this.reload();
  }
}
