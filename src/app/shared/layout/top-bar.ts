import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { LucideAngularModule, Sun, Moon, LogOut, Users, ChevronDown } from 'lucide-angular';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-top-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage, LucideAngularModule],
  host: {
    '(document:click)': 'onDocumentClick()',
  },
  template: `
    <header class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:h-16 sm:px-6 dark:border-gray-700 dark:bg-gray-800">
      <a routerLink="/clientes" class="flex items-center gap-2 sm:gap-3">
        <img ngSrc="mestriax.png" alt="Mestriax" width="36" height="36" priority class="rounded-full" />
        <span class="text-base font-semibold text-primary-500 sm:text-lg dark:text-primary-300">Mestriax</span>
      </a>
      <nav class="flex items-center gap-2 sm:gap-3">
        <span class="hidden text-sm text-gray-500 sm:inline dark:text-gray-400">Gestão de Risco Ergonômico</span>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 sm:h-9 sm:w-9 dark:text-gray-400 dark:hover:bg-gray-700"
          [attr.aria-label]="isDark() ? 'Modo claro' : 'Modo escuro'"
          (click)="themeService.toggle()"
        >
          <lucide-icon [img]="isDark() ? SunIcon : MoonIcon" [size]="18" />
        </button>

        <!-- User menu -->
        <div class="relative" #userMenu>
          <button
            type="button"
            class="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-haspopup="true"
            [attr.aria-expanded]="menuOpen()"
            (click)="menuOpen.update(v => !v); $event.stopPropagation()"
          >
            @if (user()?.avatarUrl) {
              <img [src]="user()!.avatarUrl" [alt]="user()!.name" width="32" height="32" class="h-8 w-8 rounded-full object-cover" />
            } @else {
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-xs font-medium text-white">
                {{ authService.initials() }}
              </span>
            }
            <span class="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 sm:inline dark:text-gray-200">{{ user()?.name }}</span>
            <lucide-icon [img]="ChevronDownIcon" [size]="14" class="hidden text-gray-400 sm:block" />
          </button>

          @if (menuOpen()) {
            <div class="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800" role="menu">
              <div class="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                <p class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ user()?.name }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500">{{ user()?.role }}</p>
                <p class="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{{ user()?.email }}</p>
              </div>
              <a
                routerLink="/configuracoes/usuarios"
                role="menuitem"
                class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                (click)="menuOpen.set(false)"
              >
                <lucide-icon [img]="UsersIcon" [size]="16" />
                Gerenciar Usuários
              </a>
              <button
                type="button"
                role="menuitem"
                class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                (click)="onLogout()"
              >
                <lucide-icon [img]="LogOutIcon" [size]="16" />
                Sair
              </button>
            </div>
          }
        </div>
      </nav>
    </header>
  `,
})
export class TopBar {
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isDark = computed(() => this.themeService.theme() === 'dark');
  readonly user = this.authService.currentUser;
  readonly menuOpen = signal(false);

  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;
  readonly LogOutIcon = LogOut;
  readonly UsersIcon = Users;
  readonly ChevronDownIcon = ChevronDown;

  onLogout(): void {
    this.menuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onDocumentClick(): void {
    this.menuOpen.set(false);
  }
}
