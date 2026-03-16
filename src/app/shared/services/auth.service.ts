import { Injectable, inject, signal, computed } from '@angular/core';
import { DbService, type StoredUser } from './db.service';
import type { User } from '../models/user.model';

const SEED_USERS: User[] = [
  {
    name: 'Luciula Valença',
    email: 'ftluciulavalenca@gmail.com',
    password: 'cafeinadev2026',
    role: 'Consultora em Ergonomia',
    avatarUrl: 'ftluciulavalenca.webp',
  },
];

const STORAGE_KEY = 'mestriax-auth-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly db = inject(DbService);

  readonly currentUser = signal<StoredUser | null>(this.restoreFromStorage());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly initials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return user.name
      .split(' ')
      .filter((p) => p.length > 0)
      .map((p) => p[0].toUpperCase())
      .slice(0, 2)
      .join('');
  });

  async loadUsers(): Promise<StoredUser[]> {
    let records = await this.db.getAllUsers();
    if (records.length === 0) {
      await this.db.bulkAddUsers(SEED_USERS);
      records = await this.db.getAllUsers();
    }
    return records;
  }

  async login(email: string, password: string): Promise<StoredUser | null> {
    const users = await this.loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (found) {
      this.currentUser.set(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    }
    return found ?? null;
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  refreshUser(user: StoredUser): void {
    this.currentUser.set(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  private restoreFromStorage(): StoredUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredUser) : null;
    } catch {
      return null;
    }
  }
}
