import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBar } from './top-bar';
import { ClientService } from '../services/client.service';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TopBar],
  template: `
    <div class="flex min-h-screen flex-col">
      <app-top-bar />
      <main class="flex-1 p-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppShell implements OnInit {
  private readonly clientService = inject(ClientService);

  ngOnInit(): void {
    this.clientService.loadClients();
    this.clientService.loadUnits();
  }
}
