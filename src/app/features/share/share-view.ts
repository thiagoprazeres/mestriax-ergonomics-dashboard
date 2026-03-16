import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ClientService } from '../../shared/services/client.service';
import { COMPANY } from '../../shared/models/user.model';

@Component({
  selector: 'app-share-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NgOptimizedImage],
  template: `
    <div class="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <header class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:h-16 sm:px-6 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-2 sm:gap-3">
          <img ngSrc="mestriax.png" alt="Mestriax" width="36" height="36" priority class="rounded-full" />
          <span class="text-base font-semibold text-primary-500 sm:text-lg dark:text-primary-300">{{ company.name }}</span>
        </div>
        <span class="hidden text-sm text-gray-500 sm:inline dark:text-gray-400">Visualização compartilhada</span>
      </header>

      <main class="flex-1 p-4 sm:p-6">
        <router-outlet />
      </main>

      <footer class="border-t border-gray-200 bg-white px-4 py-4 text-center text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
        {{ company.name }} · {{ company.slogan }}
      </footer>
    </div>
  `,
})
export class ShareView implements OnInit {
  private readonly clientService = inject(ClientService);
  readonly company = COMPANY;

  ngOnInit(): void {
    this.clientService.loadClients();
    this.clientService.loadUnits();
  }
}
