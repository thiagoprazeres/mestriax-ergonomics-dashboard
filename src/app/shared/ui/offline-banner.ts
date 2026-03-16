import { Component, ChangeDetectionStrategy, signal, OnInit, OnDestroy } from '@angular/core';
import { LucideAngularModule, WifiOff } from 'lucide-angular';

@Component({
  selector: 'app-offline-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    @if (offline()) {
      <div
        role="status"
        aria-live="polite"
        class="flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-xs font-medium text-white dark:bg-amber-600"
      >
        <lucide-icon [img]="WifiOffIcon" [size]="14" />
        Você está offline — os dados salvos localmente continuam disponíveis.
      </div>
    }
  `,
})
export class OfflineBanner implements OnInit, OnDestroy {
  readonly offline = signal(!navigator.onLine);
  readonly WifiOffIcon = WifiOff;

  private readonly onOnline = () => this.offline.set(false);
  private readonly onOffline = () => this.offline.set(true);

  ngOnInit(): void {
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }
}
