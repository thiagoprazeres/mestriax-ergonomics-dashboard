import { Injectable, inject, signal, computed } from '@angular/core';
import { DbService, type StoredClient, type StoredUnit } from './db.service';
import type { Client, Unit } from '../models/client.model';

const SEED_CLIENTS: Client[] = [
  { name: 'Amazon Brasil', slug: 'amazon-brasil', logoUrl: 'https://cdn.brandfetch.io/idawOgYOsG/theme/dark/logo.svg' },
  { name: 'Mercado Livre', slug: 'mercado-livre', logoUrl: 'https://cdn.brandfetch.io/id0m1a9oJ8/theme/dark/logo.svg' },
  { name: 'Magazine Luiza', slug: 'magazine-luiza', logoUrl: 'https://cdn.brandfetch.io/idSdnzDAdG/theme/dark/logo.svg' },
  { name: 'Shopee', slug: 'shopee', logoUrl: 'https://cdn.brandfetch.io/idubNy-9U5/theme/dark/logo.svg' },
  { name: 'Loggi', slug: 'loggi', logoUrl: 'https://cdn.brandfetch.io/idZaXWHgUF/theme/dark/logo.svg' },
];

const SEED_UNITS: Unit[] = [
  { name: 'REC3', slug: 'rec3', clientSlug: 'amazon-brasil', location: 'Vitória de Santo Antão - PE' },
  { name: 'GRU1', slug: 'gru1', clientSlug: 'amazon-brasil', location: 'Guarulhos - SP' },
  { name: 'GRU5', slug: 'gru5', clientSlug: 'amazon-brasil', location: 'Guarulhos - SP' },
  { name: 'SP02', slug: 'sp02', clientSlug: 'amazon-brasil', location: 'São Paulo - SP' },
  { name: 'MG01', slug: 'mg01', clientSlug: 'amazon-brasil', location: 'Belo Horizonte - MG' },
  { name: 'SP01', slug: 'sp01', clientSlug: 'mercado-livre', location: 'Osasco - SP' },
  { name: 'RJ01', slug: 'rj01', clientSlug: 'mercado-livre', location: 'Rio de Janeiro - RJ' },
  { name: 'FRA01', slug: 'fra01', clientSlug: 'magazine-luiza', location: 'Franca - SP' },
  { name: 'CWB01', slug: 'cwb01', clientSlug: 'shopee', location: 'Curitiba - PR' },
  { name: 'BSB01', slug: 'bsb01', clientSlug: 'loggi', location: 'Brasília - DF' },
];

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly db = inject(DbService);

  readonly clients = signal<StoredClient[]>([]);
  readonly units = signal<StoredUnit[]>([]);

  readonly clientCount = computed(() => this.clients().length);

  // ── Load (seed on first use) ───────────────────────

  async loadClients(): Promise<StoredClient[]> {
    let records = await this.db.getAllClients();
    if (records.length === 0) {
      await this.db.bulkAddClients(SEED_CLIENTS);
      records = await this.db.getAllClients();
    }
    this.clients.set(records);
    return records;
  }

  async loadUnits(): Promise<StoredUnit[]> {
    let records = await this.db.getAllUnits();
    if (records.length === 0) {
      await this.db.bulkAddUnits(SEED_UNITS);
      records = await this.db.getAllUnits();
    }
    this.units.set(records);
    return records;
  }

  // ── Lookups ────────────────────────────────────────

  getClient(slug: string): StoredClient | undefined {
    return this.clients().find((c) => c.slug === slug);
  }

  getUnits(clientSlug: string): StoredUnit[] {
    return this.units().filter((u) => u.clientSlug === clientSlug);
  }

  getUnit(clientSlug: string, unitSlug: string): StoredUnit | undefined {
    return this.units().find((u) => u.clientSlug === clientSlug && u.slug === unitSlug);
  }

  // ── Client CRUD ────────────────────────────────────

  async addClient(data: Client): Promise<void> {
    await this.db.addClient(data);
    this.clients.set(await this.db.getAllClients());
  }

  async updateClient(record: StoredClient): Promise<void> {
    await this.db.updateClient(record);
    this.clients.set(await this.db.getAllClients());
  }

  async deleteClient(record: StoredClient): Promise<void> {
    await this.db.deleteUnitsByClient(record.slug);
    await this.db.deleteClient(record.id);
    this.clients.set(await this.db.getAllClients());
    this.units.set(await this.db.getAllUnits());
  }

  // ── Unit CRUD ──────────────────────────────────────

  async addUnit(data: Unit): Promise<void> {
    await this.db.addUnit(data);
    this.units.set(await this.db.getAllUnits());
  }

  async updateUnit(record: StoredUnit): Promise<void> {
    await this.db.updateUnit(record);
    this.units.set(await this.db.getAllUnits());
  }

  async deleteUnit(id: number): Promise<void> {
    await this.db.deleteUnit(id);
    this.units.set(await this.db.getAllUnits());
  }
}
