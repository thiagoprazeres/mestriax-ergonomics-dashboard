# Mestriax Ergonomics Dashboard

Plataforma de dashboards analíticos para gestão de risco ergonômico, saúde ocupacional e acompanhamento de planos de ação.

O projeto transforma planilhas operacionais e avaliações ergonômicas em insights visuais e acionáveis, permitindo que consultorias e empresas tomem decisões baseadas em dados.

---

## Visão do Produto

O sistema transforma dados de:

- **AEP** (Análise Ergonômica Preliminar)
- **Fatores e grupos de risco**
- **Absenteísmo osteomuscular**
- **Planos de ação**

em dashboards interativos com gráficos clicáveis, filtros cruzados e tabelas editáveis.

**Perguntas que o sistema responde:**

- Quais setores possuem maior risco ergonômico?
- Quais cargos concentram maior exposição?
- Quantos dias foram perdidos por afastamentos?
- Quais planos de ação estão atrasados?
- O risco ergonômico está diminuindo ao longo do tempo?

---

## Dashboards

### Diagnóstico Ergonômico

Análise da exposição ergonômica na organização.

**Gráficos (Apache ECharts):**
- Donut — distribuição de risco ergonômico
- Barras empilhadas — classificação por setor e por cargo
- Linha com área — evolução temporal do risco

**KPIs:** total de avaliações, setores avaliados, risco alto, planos abertos

**Tabela:** Setor · Cargo · Classificação · Grupo de Risco · Subgrupo · Plano de Ação · Status

### Saúde Ocupacional

Monitoramento de afastamentos e absenteísmo.

**Gráficos:**
- Barras verticais — dias perdidos por setor
- Barras horizontais — dias perdidos por cargo
- Linha com área — evolução mensal de absenteísmo

**KPIs:** dias perdidos, casos registrados, setor mais afetado

**Tabela:** Matrícula · Cargo · Setor · CID · Data Início · Retorno · Dias Perdidos

### Gestão do Plano de Ação

Acompanhamento das ações corretivas.

**Gráficos:**
- Donut — status dos planos (Aberto / Concluído / Atrasado)
- Barras verticais — planos por setor

**KPIs:** planos abertos, concluídos, atrasados

**Tabela:** Ação · Setor · Responsável · Prazo · Status

### Gestão de Dados

Página dedicada para importação, edição e exportação de dados.

- **Import CSV** — drag-and-drop com validação de formato e tamanho
- **CRUD completo** — adicionar, editar inline (AG Grid), excluir registros
- **Export CSV** — download dos dados atuais
- **Persistência local** — dados armazenados no IndexedDB do navegador
- **Fallback automático** — na primeira visita, carrega dados de exemplo dos CSVs estáticos

---

## Cross-Filtering (Filtros Cruzados)

Todos os gráficos são interativos — clicar em uma fatia de pizza, barra ou ponto do gráfico aplica automaticamente um filtro que atualiza:

- Os demais gráficos
- Os KPIs
- A tabela de dados

Um chip de filtro ativo aparece no card do gráfico com botão ✕ para limpar.

---

## Stack Tecnológica

| Camada | Tecnologias |
|--------|-------------|
| **Framework** | Angular 21 (standalone components, signals, strict mode) |
| **Estilização** | Tailwind CSS 4 |
| **Gráficos** | Apache ECharts + ngx-echarts |
| **Tabelas** | AG Grid Community |
| **Ícones** | Lucide Angular |
| **Parsing CSV** | Papa Parse |
| **Persistência** | IndexedDB (via `idb`) |
| **Arquitetura** | Feature-based, sem backend |

---

## Estrutura do Projeto

```
src/app/
├── features/
│   ├── auth/login.ts
│   ├── clients/clients.ts
│   ├── units/units.ts
│   ├── dashboard-selection/dashboard-selection.ts
│   ├── ergonomics-diagnosis/ergonomics-diagnosis.ts
│   ├── occupational-health/occupational-health.ts
│   ├── action-plan/action-plan.ts
│   └── data-management/data-management.ts
├── shared/
│   ├── layout/
│   │   ├── app-shell.ts
│   │   ├── top-bar.ts
│   │   └── breadcrumb.ts
│   ├── ui/
│   │   ├── chart-card.ts
│   │   ├── data-grid-card.ts
│   │   ├── kpi-card.ts
│   │   ├── filter-bar.ts
│   │   ├── card-list.ts
│   │   └── csv-upload.ts
│   ├── services/
│   │   ├── data.service.ts      ← camada de dados (IndexedDB + fallback CSV)
│   │   ├── db.service.ts        ← wrapper IndexedDB (idb)
│   │   ├── csv.service.ts       ← parser CSV + interpolação de dados
│   │   └── mock-data.service.ts ← dados mock de clientes/unidades
│   └── models/
│       ├── aep.model.ts
│       ├── absenteeism.model.ts
│       ├── employee.model.ts
│       └── client.model.ts
└── public/assets/data/           ← CSVs estáticos de exemplo
```

---

## Fluxo de Dados

```
┌─────────────────┐     ┌──────────────┐     ┌───────────┐
│  Upload CSV      │────▶│  Papa Parse   │────▶│ IndexedDB │
│  (drag & drop)   │     │  (validação)  │     │   (idb)   │
└─────────────────┘     └──────────────┘     └─────┬─────┘
                                                    │
┌─────────────────┐                                 │
│  CSV estático    │─── fallback (1ª visita) ───────┘
│  /assets/data/   │                                 │
└─────────────────┘                                 ▼
                                              ┌───────────┐
                                              │DataService │
                                              │ (signals)  │
                                              └─────┬─────┘
                                                    │
                         ┌──────────────────────────┼──────────────┐
                         ▼                          ▼              ▼
                    ┌─────────┐              ┌──────────┐   ┌──────────┐
                    │ Gráficos │              │   KPIs   │   │ AG Grid  │
                    │ ECharts  │◀── cross ──▶│          │   │ (edição) │
                    └─────────┘   filtering  └──────────┘   └──────────┘
```

---

## Inicialização

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
ng serve

# Build de produção
ng build
```

### Dependências principais

```bash
npm install echarts ngx-echarts           # gráficos
npm install ag-grid-angular ag-grid-community  # tabelas
npm install papaparse idb                 # CSV + IndexedDB
npm install lucide-angular                # ícones
npm install -D @types/papaparse
```

---

## Roadmap

### ✅ Concluído
- Dashboards analíticos (diagnóstico, saúde ocupacional, plano de ação)
- Gráficos interativos com Apache ECharts (donut, barras, linhas)
- Cross-filtering — clicar em gráfico filtra todos os outros
- Gestão de dados — import CSV, CRUD com IndexedDB, export CSV
- Interpolação temporal de dados para demonstração
- Navegação multi-cliente / multi-unidade

### 🔜 Próximos passos
- Correlação risco × afastamentos
- Geração automática de insights
- Supabase (multi-usuário, auth, sync em tempo real)
- Exportação de relatórios PDF
- Suporte multiempresa (SaaS)

---

## Licença

MIT License