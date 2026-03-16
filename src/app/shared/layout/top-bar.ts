import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-top-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <header class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:h-16 sm:px-6">
      <a routerLink="/clientes" class="flex items-center gap-2 sm:gap-3">
        <img ngSrc="mestriax.png" alt="Mestriax" width="36" height="36" priority class="rounded-full" />
        <span class="text-base font-semibold text-primary-500 sm:text-lg">Mestriax</span>
      </a>
      <nav class="flex items-center gap-3 sm:gap-4">
        <span class="hidden text-sm text-gray-500 sm:inline">Gestão de Risco Ergonômico</span>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-medium text-white sm:h-9 sm:w-9"
          aria-label="Perfil do usuário"
        >
          U
        </button>
      </nav>
    </header>
  `,
})
export class TopBar {}
