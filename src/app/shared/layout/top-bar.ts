import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-top-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <a routerLink="/clientes" class="flex items-center gap-3">
        <img ngSrc="mestriax.png" alt="Mestriax" width="40" height="40" priority class="rounded-full" />
        <span class="text-lg font-semibold text-primary-500">Mestriax</span>
      </a>
      <nav class="flex items-center gap-4">
        <span class="text-sm text-gray-500">Gestão de Risco Ergonômico</span>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-sm font-medium text-white"
          aria-label="Perfil do usuário"
        >
          U
        </button>
      </nav>
    </header>
  `,
})
export class TopBar {}
