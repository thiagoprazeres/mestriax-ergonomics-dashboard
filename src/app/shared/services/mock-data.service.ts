import { Injectable } from '@angular/core';
import { Client, Unit } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly clients: Client[] = [
    { id: '1', name: 'Amazon Brasil', slug: 'amazon-brasil' },
    { id: '2', name: 'Mercado Livre', slug: 'mercado-livre' },
    { id: '3', name: 'Magazine Luiza', slug: 'magazine-luiza' },
    { id: '4', name: 'Shopee', slug: 'shopee' },
    { id: '5', name: 'Loggi', slug: 'loggi' },
  ];

  readonly unitsByClient: Record<string, Unit[]> = {
    'amazon-brasil': [
      { id: '1', name: 'REC3', slug: 'rec3', clientSlug: 'amazon-brasil', location: 'Vitória de Santo Antão - PE' },
      { id: '2', name: 'GRU1', slug: 'gru1', clientSlug: 'amazon-brasil', location: 'Guarulhos - SP' },
      { id: '3', name: 'GRU5', slug: 'gru5', clientSlug: 'amazon-brasil', location: 'Guarulhos - SP' },
      { id: '4', name: 'SP02', slug: 'sp02', clientSlug: 'amazon-brasil', location: 'São Paulo - SP' },
      { id: '5', name: 'MG01', slug: 'mg01', clientSlug: 'amazon-brasil', location: 'Belo Horizonte - MG' },
    ],
    'mercado-livre': [
      { id: '6', name: 'SP01', slug: 'sp01', clientSlug: 'mercado-livre', location: 'Osasco - SP' },
      { id: '7', name: 'RJ01', slug: 'rj01', clientSlug: 'mercado-livre', location: 'Rio de Janeiro - RJ' },
    ],
    'magazine-luiza': [
      { id: '8', name: 'FRA01', slug: 'fra01', clientSlug: 'magazine-luiza', location: 'Franca - SP' },
    ],
    'shopee': [
      { id: '9', name: 'CWB01', slug: 'cwb01', clientSlug: 'shopee', location: 'Curitiba - PR' },
    ],
    'loggi': [
      { id: '10', name: 'BSB01', slug: 'bsb01', clientSlug: 'loggi', location: 'Brasília - DF' },
    ],
  };

  getClient(slug: string): Client | undefined {
    return this.clients.find((c) => c.slug === slug);
  }

  getUnits(clientSlug: string): Unit[] {
    return this.unitsByClient[clientSlug] ?? [];
  }

  getUnit(clientSlug: string, unitSlug: string): Unit | undefined {
    return this.getUnits(clientSlug).find((u) => u.slug === unitSlug);
  }
}
