import { Injectable } from '@angular/core';
import { openDB, type IDBPDatabase } from 'idb';
import { AepRecord } from '../models/aep.model';
import { AbsenteeismRecord } from '../models/absenteeism.model';
import { Client, Unit } from '../models/client.model';
import type { User } from '../models/user.model';

export interface StoredAepRecord extends AepRecord {
  id: number;
}

export interface StoredAbsenteeismRecord extends AbsenteeismRecord {
  id: number;
}

export interface StoredClient extends Client {
  id: number;
}

export interface StoredUnit extends Unit {
  id: number;
}

export interface StoredUser extends User {
  id: number;
}

const DB_NAME = 'mestriax-ergo';
const DB_VERSION = 3;

@Injectable({ providedIn: 'root' })
export class DbService {
  private dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('aep')) {
        db.createObjectStore('aep', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('absenteeism')) {
        db.createObjectStore('absenteeism', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('clients')) {
        db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('units')) {
        db.createObjectStore('units', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
      }
    },
  });

  // ── AEP ──────────────────────────────────────────────

  async getAllAep(): Promise<StoredAepRecord[]> {
    const db = await this.dbPromise;
    return db.getAll('aep');
  }

  async countAep(): Promise<number> {
    const db = await this.dbPromise;
    return db.count('aep');
  }

  async addAep(record: AepRecord): Promise<number> {
    const db = await this.dbPromise;
    return db.add('aep', record) as Promise<number>;
  }

  async bulkAddAep(records: AepRecord[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('aep', 'readwrite');
    for (const r of records) {
      tx.store.add(r);
    }
    await tx.done;
  }

  async updateAep(record: StoredAepRecord): Promise<void> {
    const db = await this.dbPromise;
    await db.put('aep', record);
  }

  async deleteAep(id: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('aep', id);
  }

  async clearAep(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear('aep');
  }

  // ── Absenteeism ──────────────────────────────────────

  async getAllAbsenteeism(): Promise<StoredAbsenteeismRecord[]> {
    const db = await this.dbPromise;
    return db.getAll('absenteeism');
  }

  async countAbsenteeism(): Promise<number> {
    const db = await this.dbPromise;
    return db.count('absenteeism');
  }

  async addAbsenteeism(record: AbsenteeismRecord): Promise<number> {
    const db = await this.dbPromise;
    return db.add('absenteeism', record) as Promise<number>;
  }

  async bulkAddAbsenteeism(records: AbsenteeismRecord[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('absenteeism', 'readwrite');
    for (const r of records) {
      tx.store.add(r);
    }
    await tx.done;
  }

  async updateAbsenteeism(record: StoredAbsenteeismRecord): Promise<void> {
    const db = await this.dbPromise;
    await db.put('absenteeism', record);
  }

  async deleteAbsenteeism(id: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('absenteeism', id);
  }

  async clearAbsenteeism(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear('absenteeism');
  }

  // ── Clients ─────────────────────────────────────────

  async getAllClients(): Promise<StoredClient[]> {
    const db = await this.dbPromise;
    return db.getAll('clients');
  }

  async countClients(): Promise<number> {
    const db = await this.dbPromise;
    return db.count('clients');
  }

  async addClient(record: Omit<StoredClient, 'id'>): Promise<number> {
    const db = await this.dbPromise;
    return db.add('clients', record) as Promise<number>;
  }

  async bulkAddClients(records: Omit<StoredClient, 'id'>[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('clients', 'readwrite');
    for (const r of records) {
      tx.store.add(r);
    }
    await tx.done;
  }

  async updateClient(record: StoredClient): Promise<void> {
    const db = await this.dbPromise;
    await db.put('clients', record);
  }

  async deleteClient(id: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('clients', id);
  }

  // ── Units ───────────────────────────────────────────

  async getAllUnits(): Promise<StoredUnit[]> {
    const db = await this.dbPromise;
    return db.getAll('units');
  }

  async addUnit(record: Omit<StoredUnit, 'id'>): Promise<number> {
    const db = await this.dbPromise;
    return db.add('units', record) as Promise<number>;
  }

  async bulkAddUnits(records: Omit<StoredUnit, 'id'>[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('units', 'readwrite');
    for (const r of records) {
      tx.store.add(r);
    }
    await tx.done;
  }

  async updateUnit(record: StoredUnit): Promise<void> {
    const db = await this.dbPromise;
    await db.put('units', record);
  }

  async deleteUnit(id: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('units', id);
  }

  async deleteUnitsByClient(clientSlug: string): Promise<void> {
    const db = await this.dbPromise;
    const all = await db.getAll('units') as StoredUnit[];
    const tx = db.transaction('units', 'readwrite');
    for (const u of all) {
      if (u.clientSlug === clientSlug) {
        tx.store.delete(u.id);
      }
    }
    await tx.done;
  }

  // ── Users ────────────────────────────────────────

  async getAllUsers(): Promise<StoredUser[]> {
    const db = await this.dbPromise;
    return db.getAll('users');
  }

  async countUsers(): Promise<number> {
    const db = await this.dbPromise;
    return db.count('users');
  }

  async addUser(record: Omit<StoredUser, 'id'>): Promise<number> {
    const db = await this.dbPromise;
    return db.add('users', record) as Promise<number>;
  }

  async bulkAddUsers(records: Omit<StoredUser, 'id'>[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('users', 'readwrite');
    for (const r of records) {
      tx.store.add(r);
    }
    await tx.done;
  }

  async updateUser(record: StoredUser): Promise<void> {
    const db = await this.dbPromise;
    await db.put('users', record);
  }

  async deleteUser(id: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('users', id);
  }
}
