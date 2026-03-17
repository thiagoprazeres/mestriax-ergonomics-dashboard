import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { AuthService } from '../../shared/services/auth.service';
import { COMPANY } from '../../shared/models/user.model';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgOptimizedImage, LucideAngularModule],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-primary-500 to-primary-700 px-4 dark:from-gray-900 dark:to-gray-800">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        <div class="mb-8 flex flex-col items-center gap-3">
          <img ngSrc="mestriax.png" alt="Mestriax" width="80" height="80" priority class="rounded-full" />
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ company.name }}</h1>
          <p class="text-center text-sm text-gray-400 dark:text-gray-500">{{ company.slogan }}</p>
        </div>
        <form (ngSubmit)="onLogin()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label for="email" class="text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="seu@email.com"
              required
              autocomplete="email"
              class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="password" class="text-sm font-medium text-gray-600 dark:text-gray-300">Senha</label>
            <div class="relative">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                required
                autocomplete="current-password"
                class="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
                [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
                (click)="showPassword.set(!showPassword())"
              >
                @if (showPassword()) {
                  <lucide-icon [img]="EyeOffIcon" [size]="18" />
                } @else {
                  <lucide-icon [img]="EyeIcon" [size]="18" />
                }
              </button>
            </div>
          </div>
          @if (errorMsg()) {
            <div class="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300" role="alert">
              {{ errorMsg() }}
            </div>
          }
          <button
            type="submit"
            [disabled]="submitting()"
            class="mt-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none disabled:opacity-60"
          >
            {{ submitting() ? 'Entrando…' : 'Entrar' }}
          </button>
        </form>
      </div>

      <div class="mt-8 flex flex-col items-center gap-1 text-center text-xs text-white/70">
        <span>{{ company.phone }} · {{ company.email }}</span>
        <a [href]="company.instagram" target="_blank" rel="noopener" class="underline hover:text-white">
          &#64;amestriax
        </a>
      </div>
    </div>
  `,
})
export class Login {
  protected email = '';
  protected password = '';

  readonly company = COMPANY;
  readonly errorMsg = signal('');
  readonly submitting = signal(false);
  readonly showPassword = signal(false);

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  async onLogin(): Promise<void> {
    this.errorMsg.set('');
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMsg.set('Preencha e-mail e senha.');
      return;
    }
    this.submitting.set(true);
    try {
      const user = await this.authService.login(this.email.trim(), this.password);
      if (user) {
        this.router.navigate(['/clientes']);
      } else {
        this.errorMsg.set('E-mail ou senha inválidos.');
      }
    } finally {
      this.submitting.set(false);
    }
  }
}
