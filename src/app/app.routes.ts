import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: 'clientes',
    loadComponent: () => import('./shared/layout/app-shell').then((m) => m.AppShell),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/clients/clients').then((m) => m.Clients),
      },
      {
        path: ':clienteId/unidades',
        loadComponent: () => import('./features/units/units').then((m) => m.Units),
      },
      {
        path: ':clienteId/unidades/:unidadeId/dashboard',
        loadComponent: () =>
          import('./features/dashboard-selection/dashboard-selection').then((m) => m.DashboardSelection),
      },
      {
        path: ':clienteId/unidades/:unidadeId/dashboard/diagnostico-ergonomico',
        loadComponent: () =>
          import('./features/ergonomics-diagnosis/ergonomics-diagnosis').then((m) => m.ErgonomicsDiagnosis),
      },
      {
        path: ':clienteId/unidades/:unidadeId/dashboard/saude-ocupacional',
        loadComponent: () =>
          import('./features/occupational-health/occupational-health').then((m) => m.OccupationalHealth),
      },
      {
        path: ':clienteId/unidades/:unidadeId/dashboard/plano-de-acao',
        loadComponent: () => import('./features/action-plan/action-plan').then((m) => m.ActionPlan),
      },
      {
        path: ':clienteId/unidades/:unidadeId/dashboard/gestao-de-dados',
        loadComponent: () => import('./features/data-management/data-management').then((m) => m.DataManagement),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
