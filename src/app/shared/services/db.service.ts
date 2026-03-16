import { Injectable } from '@angular/core';
import { openDB, type IDBPDatabase } from 'idb';
import { AepRecord } from '../models/aep.model';
import { AbsenteeismRecord } from '../models/absenteeism.model';

export interface StoredAepRecord extends AepRecord {
  id: number;
}

export interface StoredAbsenteeismRecord extends AbsenteeismRecord {
  id: number;
}

const DB_NAME = 'mestriax-ergo';
const DB_VERSION = 1;

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
}
