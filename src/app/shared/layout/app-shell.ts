import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBar } from './top-bar';

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
export class AppShell {}
