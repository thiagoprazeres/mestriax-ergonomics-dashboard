import { Injectable, inject, signal, computed } from '@angular/core';
import { DbService, type StoredAepRecord, type StoredAbsenteeismRecord } from './db.service';
import { CsvService } from './csv.service';
import { AepRecord } from '../models/aep.model';
import { AbsenteeismRecord } from '../models/absenteeism.model';
import Papa from 'papaparse';

export type DatasetKey = 'aep' | 'absenteeism';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly db = inject(DbService);
  private readonly csv = inject(CsvService);

  readonly aepData = signal<StoredAepRecord[]>([]);
  readonly absenteeismData = signal<StoredAbsenteeismRecord[]>([]);

  readonly aepCount = computed(() => this.aepData().length);
  readonly absenteeismCount = computed(() => this.absenteeismData().length);

  // ── Load (IndexedDB first, fallback to static CSV) ──

  async loadAep(): Promise<StoredAepRecord[]> {
    let records = await this.db.getAllAep();
    if (records.length === 0) {
      const csvData = await this.csv.loadAep();
      await this.db.bulkAddAep(csvData);
      records = await this.db.getAllAep();
    }
    this.aepData.set(records);
    return records;
  }

  async loadAbsenteeism(): Promise<StoredAbsenteeismRecord[]> {
    let records = await this.db.getAllAbsenteeism();
    if (records.length === 0) {
      const csvData = await this.csv.loadAbsenteeism();
      await this.db.bulkAddAbsenteeism(csvData);
      records = await this.db.getAllAbsenteeism();
    }
    this.absenteeismData.set(records);
    return records;
  }

  // ── CSV Import ──

  async importAepCsv(file: File): Promise<number> {
    const text = await file.text();
    const records = this.parseAepCsv(text);
    await this.db.clearAep();
    await this.db.bulkAddAep(records);
    const all = await this.db.getAllAep();
    this.aepData.set(all);
    return records.length;
  }

  async importAbsenteeismCsv(file: File): Promise<number> {
    const text = await file.text();
    const records = this.parseAbsenteeismCsv(text);
    await this.db.clearAbsenteeism();
    await this.db.bulkAddAbsenteeism(records);
    const all = await this.db.getAllAbsenteeism();
    this.absenteeismData.set(all);
    return records.length;
  }

  // ── CRUD ──

  async addAepRecord(record: AepRecord): Promise<void> {
    await this.db.addAep(record);
    this.aepData.set(await this.db.getAllAep());
  }

  async updateAepRecord(record: StoredAepRecord): Promise<void> {
    await this.db.updateAep(record);
    this.aepData.set(await this.db.getAllAep());
  }

  async deleteAepRecord(id: number): Promise<void> {
    await this.db.deleteAep(id);
    this.aepData.set(await this.db.getAllAep());
  }

  async addAbsenteeismRecord(record: AbsenteeismRecord): Promise<void> {
    await this.db.addAbsenteeism(record);
    this.absenteeismData.set(await this.db.getAllAbsenteeism());
  }

  async updateAbsenteeismRecord(record: StoredAbsenteeismRecord): Promise<void> {
    await this.db.updateAbsenteeism(record);
    this.absenteeismData.set(await this.db.getAllAbsenteeism());
  }

  async deleteAbsenteeismRecord(id: number): Promise<void> {
    await this.db.deleteAbsenteeism(id);
    this.absenteeismData.set(await this.db.getAllAbsenteeism());
  }

  // ── Clear ──

  async clearAep(): Promise<void> {
    await this.db.clearAep();
    this.aepData.set([]);
  }

  async clearAbsenteeism(): Promise<void> {
    await this.db.clearAbsenteeism();
    this.absenteeismData.set([]);
  }

  // ── CSV Export ──

  exportAepCsv(): string {
    const data = this.aepData();
    const headers = [
      'Data', 'Unidade', 'Setor', 'Cargo', 'Caracterização da Atividade',
      'Fonte Geradora', 'Grupo de Risco', 'Sub Grupo de Risco', '% Exposição',
      'Medidas de Controle Existentes', 'Probabilidade', 'Severidade',
      'Nível de Risco', 'Classificação', 'Avaliação Ambiental',
      'Plano de Ação', 'Responsável', 'Prazo', 'Status',
    ];
    const rows = data.map((r) => [
      r.data, r.unidade, r.setor, r.cargo, r.caracterizacaoAtividade,
      r.fonteGeradora, r.grupoRisco, r.subGrupoRisco, r.percentualExposicao,
      r.medidasControle, r.probabilidade, r.severidade, r.nivelRisco,
      r.classificacao, r.avaliacaoAmbiental, r.planoAcao, r.responsavel,
      r.prazo, r.status,
    ]);
    return Papa.unparse({ fields: headers, data: rows });
  }

  exportAbsenteeismCsv(): string {
    const data = this.absenteeismData();
    const headers = ['Matrícula', 'Cargo', 'Setor', 'CID', 'Data Início', 'Retorno', 'Dias Perdidos'];
    const rows = data.map((r) => [
      r.matricula, r.cargo, r.setor, r.cid, r.dataInicio, r.retorno, r.diasPerdidos,
    ]);
    return Papa.unparse({ fields: headers, data: rows });
  }

  // ── Private parsers ──

  private parseAepCsv(text: string): AepRecord[] {
    const result = Papa.parse<Record<string, string>>(text, {
      header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim(),
    });
    return result.data.map((row) => ({
      data: row['Data'] ?? '',
      unidade: row['Unidade'] ?? '',
      setor: (row['Setor'] ?? '').trim(),
      cargo: (row['Cargo'] ?? '').trim(),
      caracterizacaoAtividade: row['Caracterização da Atividade'] ?? '',
      fonteGeradora: row['Fonte Geradora'] ?? '',
      grupoRisco: (row['Grupo de Risco'] ?? '').trim(),
      subGrupoRisco: (row['Sub Grupo de Risco'] ?? '').trim(),
      percentualExposicao: row['% Exposição'] ?? '',
      medidasControle: row['Medidas de Controle Existentes'] ?? '',
      probabilidade: parseInt(row['Probabilidade (1-5)'] ?? row['Probabilidade'] ?? '0', 10),
      severidade: parseInt(row['Severidade (1-5)'] ?? row['Severidade'] ?? '0', 10),
      nivelRisco: parseInt(row['Nível de Risco (P x S)'] ?? row['Nível de Risco'] ?? '0', 10),
      classificacao: (row['Classificação'] ?? '').trim(),
      avaliacaoAmbiental: row['Avaliação Ambiental'] ?? '',
      planoAcao: (row['Plano de Ação'] ?? '').trim(),
      responsavel: (row['Responsável'] ?? '').trim(),
      prazo: (row['Prazo'] ?? '').trim(),
      status: (row['Status'] ?? '').trim(),
    }));
  }

  private parseAbsenteeismCsv(text: string): AbsenteeismRecord[] {
    const result = Papa.parse<Record<string, string>>(text, {
      header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim(),
    });
    return result.data.map((row) => ({
      matricula: (row['Matrícula'] ?? row['Matricula'] ?? '').trim(),
      cargo: (row['Cargo'] ?? '').trim(),
      setor: (row['Setor'] ?? '').trim(),
      cid: (row['CID'] ?? '').trim(),
      dataInicio: (row['Data Início'] ?? row['Data Inicio'] ?? '').trim(),
      retorno: (row['Retorno'] ?? '').trim(),
      diasPerdidos: parseInt(row['Dias Perdidos'] ?? '0', 10),
    }));
  }
}
