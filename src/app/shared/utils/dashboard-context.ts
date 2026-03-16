import { inject, signal, computed, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from '../services/client.service';
import type { BreadcrumbItem } from '../layout/breadcrumb';

export interface DashboardContext {
  clientSlug: WritableSignal<string>;
  unitSlug: WritableSignal<string>;
  clientName: ReturnType<typeof computed<string>>;
  clientLogo: ReturnType<typeof computed<string>>;
  unitName: ReturnType<typeof computed<string>>;
  breadcrumbs: (lastLabel: string) => ReturnType<typeof computed<BreadcrumbItem[]>>;
}

export function useDashboardContext(): DashboardContext {
  const route = inject(ActivatedRoute);
  const clientService = inject(ClientService);

  const clientSlug = signal(route.snapshot.paramMap.get('clienteId') ?? '');
  const unitSlug = signal(route.snapshot.paramMap.get('unidadeId') ?? '');

  const clientName = computed(() => clientService.getClient(clientSlug())?.name ?? clientSlug());
  const clientLogo = computed(() => clientService.getClient(clientSlug())?.logoUrl ?? '');
  const unitName = computed(() => clientService.getUnit(clientSlug(), unitSlug())?.name ?? unitSlug());

  const breadcrumbs = (lastLabel: string) =>
    computed<BreadcrumbItem[]>(() => [
      { label: 'Clientes', route: '/clientes' },
      { label: clientName(), route: `/clientes/${clientSlug()}/unidades` },
      { label: unitName(), route: `/clientes/${clientSlug()}/unidades/${unitSlug()}/dashboard` },
      { label: lastLabel },
    ]);

  return { clientSlug, unitSlug, clientName, clientLogo, unitName, breadcrumbs };
}

export function toggleFilter(filterSignal: WritableSignal<string>, name: string | undefined): void {
  if (!name) return;
  filterSignal.set(filterSignal() === name ? '' : name);
}
