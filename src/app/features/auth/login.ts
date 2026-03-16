import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgOptimizedImage],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-linear-to-br from-primary-500 to-primary-700 px-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div class="mb-8 flex flex-col items-center gap-3">
          <img ngSrc="mestriax.png" alt="Mestriax" width="80" height="80" priority class="rounded-full" />
          <h1 class="text-xl font-bold text-gray-800">Mestriax</h1>
          <p class="text-sm text-gray-400">Gestão de Risco Ergonômico</p>
        </div>
        <form (ngSubmit)="onLogin()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label for="email" class="text-sm font-medium text-gray-600">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="seu@email.com"
              required
              class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="password" class="text-sm font-medium text-gray-600">Senha</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
              class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            class="mt-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none"
          >
            Entrar
          </button>
          <a href="#" class="text-center text-sm text-primary-500 hover:underline">Esqueceu a senha?</a>
        </form>
      </div>
    </div>
  `,
})
export class Login {
  protected email = '';
  protected password = '';

  private readonly router = inject(Router);

  onLogin(): void {
    this.router.navigate(['/clientes']);
  }
}
