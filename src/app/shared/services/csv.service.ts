import { Injectable } from '@angular/core';
import Papa from 'papaparse';
import { AepRecord } from '../models/aep.model';
import { AbsenteeismRecord } from '../models/absenteeism.model';
import { Employee } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class CsvService {
  private async fetchCsv<T>(url: string, transformFn: (row: Record<string, string>, index: number) => T): Promise<T[]> {
    const response = await fetch(url);
    const text = await response.text();
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    });
    return result.data.map((row, index) => transformFn(row, index));
  }

  async loadAep(): Promise<AepRecord[]> {
    const raw = await this.fetchCsv('/assets/data/aep.csv', (row) => ({
      unidade: row['Unidade'] ?? '',
      setor: (row['Setor'] ?? '').trim(),
      cargo: (row['Cargo'] ?? '').trim(),
      caracterizacaoAtividade: row['Caracterização da Atividade'] ?? '',
      fonteGeradora: row['Fonte Geradora'] ?? '',
      grupoRisco: (row['Grupo de Risco'] ?? '').trim(),
      subGrupoRisco: (row['Sub Grupo de Risco'] ?? '').trim(),
      percentualExposicao: row['% Exposição'] ?? '',
      medidasControle: row['Medidas de Controle Existentes'] ?? '',
      probabilidade: parseInt(row['Probabilidade (1-5)'] ?? '0', 10),
      severidade: parseInt(row['Severidade (1-5)'] ?? '0', 10),
      nivelRisco: parseInt(row['Nível de Risco (P x S)'] ?? '0', 10),
      classificacao: (row['Classificação'] ?? '').trim(),
      avaliacaoAmbiental: row['Avaliação Ambiental'] ?? '',
      planoAcao: (row['Plano de Ação'] ?? '').trim(),
      responsavel: (row['Responsável'] ?? '').trim(),
      prazo: (row['Prazo'] ?? '').trim(),
      statusRaw: (row['Status'] ?? '').trim(),
    }));
    return this.interpolateAep(raw);
  }

  private interpolateAep(raw: Array<Omit<AepRecord, 'data' | 'status'> & { statusRaw: string }>): AepRecord[] {
    const months = ['01/2024', '02/2024', '03/2024', '04/2024', '05/2024', '06/2024'];
    const classifications = ['Muito Alta', 'Alto', 'Moderado', 'Baixo'];
    const statuses = ['Pendente', 'Em Ação', 'Concluído'];
    const result: AepRecord[] = [];
    let idx = 0;

    for (const month of months) {
      const monthIdx = months.indexOf(month);
      // Risk improves over time: earlier months have more Alto/Muito Alta
      const riskShift = monthIdx * 0.08;

      for (const base of raw) {
        const day = ((idx * 7) % 28) + 1;
        const data = `${String(day).padStart(2, '0')}/${month}`;

        // Shift classification toward lower risk in later months
        let cls = base.classificacao;
        const rand = this.seededRandom(idx);
        if (rand < riskShift) {
          const clsIdx = classifications.indexOf(cls);
          if (clsIdx >= 0 && clsIdx < classifications.length - 1) {
            cls = classifications[clsIdx + 1];
          }
        }

        const prob = cls === 'Muito Alta' ? 5 : cls === 'Alto' ? 4 : cls === 'Moderado' ? 3 : 2;
        const sev = cls === 'Muito Alta' ? 5 : cls === 'Alto' ? 4 : cls === 'Moderado' ? 3 : 2;

        let status = base.statusRaw;
        if (!status && base.planoAcao) {
          const weights = cls === 'Muito Alta' || cls === 'Alto'
            ? [0.5, 0.35, 0.15]
            : [0.15, 0.25, 0.6];
          // Later months have more Concluído
          const adjusted = [
            weights[0] * (1 - monthIdx * 0.1),
            weights[1],
            weights[2] + weights[0] * monthIdx * 0.1,
          ];
          const total = adjusted[0] + adjusted[1] + adjusted[2];
          const pick = this.seededRandom(idx + 9999);
          const c0 = adjusted[0] / total;
          const c1 = c0 + adjusted[1] / total;
          status = pick < c0 ? statuses[0] : pick < c1 ? statuses[1] : statuses[2];
        }

        result.push({
          data,
          unidade: base.unidade,
          setor: base.setor,
          cargo: base.cargo,
          caracterizacaoAtividade: base.caracterizacaoAtividade,
          fonteGeradora: base.fonteGeradora,
          grupoRisco: base.grupoRisco,
          subGrupoRisco: base.subGrupoRisco,
          percentualExposicao: base.percentualExposicao,
          medidasControle: base.medidasControle,
          probabilidade: prob,
          severidade: sev,
          nivelRisco: prob * sev,
          classificacao: cls,
          avaliacaoAmbiental: base.avaliacaoAmbiental,
          planoAcao: base.planoAcao,
          responsavel: base.responsavel,
          prazo: base.prazo,
          status,
        });
        idx++;
      }
    }
    return result;
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  }

  async loadAbsenteeism(): Promise<AbsenteeismRecord[]> {
    const response = await fetch('/assets/data/absenteismo.csv');
    const text = await response.text();
    const result = Papa.parse<string[]>(text, {
      header: false,
      skipEmptyLines: true,
    });
    const rows = result.data;
    if (rows.length <= 1) return [];
    const raw = rows.slice(1).map((cols) => ({
      matricula: (cols[0] ?? '').trim(),
      cargo: (cols[1] ?? '').trim(),
      setor: (cols[2] ?? '').trim(),
      cid: (cols[3] ?? '').trim(),
      dataInicio: (cols[4] ?? '').trim(),
      retorno: (cols[5] ?? '').trim(),
      diasPerdidos: parseInt(cols[6] ?? '0', 10),
    }));
    return this.interpolateAbsenteeism(raw);
  }

  private interpolateAbsenteeism(raw: AbsenteeismRecord[]): AbsenteeismRecord[] {
    const months = [
      { m: '01', y: '2024' }, { m: '02', y: '2024' }, { m: '03', y: '2024' },
      { m: '04', y: '2024' }, { m: '05', y: '2024' }, { m: '06', y: '2024' },
    ];
    const cids = ['M54', 'M65', 'M75', 'M77', 'M79'];
    const result: AbsenteeismRecord[] = [];
    let idx = 0;

    for (const { m, y } of months) {
      for (const base of raw) {
        const day = ((idx * 3) % 28) + 1;
        const dias = Math.max(1, base.diasPerdidos + Math.round((this.seededRandom(idx) - 0.5) * 10));
        const retDay = Math.min(28, day + dias);
        result.push({
          matricula: base.matricula,
          cargo: base.cargo,
          setor: base.setor,
          cid: cids[Math.floor(this.seededRandom(idx + 7777) * cids.length)],
          dataInicio: `${m}/${String(day).padStart(2, '0')}/${y}`,
          retorno: `${m}/${String(retDay).padStart(2, '0')}/${y}`,
          diasPerdidos: dias,
        });
        idx++;
      }
    }
    return result;
  }

  async loadEmployees(): Promise<Employee[]> {
    return this.fetchCsv<Employee>('/assets/data/mapeamento-empregados.csv', (row) => ({
      matricula: row['Matrícula'] ?? '',
      nome: row['Nome'] ?? '',
      cargo: (row['Cargo'] ?? '').trim(),
      dataEntrada: row['Data de Entrada'] ?? '',
      dataSaida: row['Data de Saída'] ?? '',
      ghre: row['GHRE'] ?? '',
    }));
  }
}
