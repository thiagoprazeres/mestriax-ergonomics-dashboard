import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ModuleRegistry as ChartsModuleRegistry, AllCommunityModule as AllChartsModule } from 'ag-charts-community';
import { ModuleRegistry as GridModuleRegistry, AllCommunityModule as AllGridModule } from 'ag-grid-community';

import { routes } from './app.routes';

ChartsModuleRegistry.registerModules([AllChartsModule]);
GridModuleRegistry.registerModules([AllGridModule]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
