Mestriax Ergonomics Dashboard

Plataforma de dashboards analíticos para gestão de risco ergonômico, saúde ocupacional e acompanhamento de planos de ação.

O projeto foi concebido para transformar planilhas operacionais e avaliações ergonômicas em insights visuais e acionáveis, permitindo que consultorias e empresas tomem decisões baseadas em dados.

Inicialmente desenvolvido como protótipo funcional para consultoria ergonômica, o sistema evolui para uma arquitetura escalável de análise ocupacional.

⸻

Visão do Produto

O sistema permite transformar dados como:
	•	AEP (Análise Ergonômica Preliminar)
	•	fatores de risco
	•	grupos de risco
	•	absenteísmo osteomuscular
	•	planos de ação

em dashboards interativos para análise gerencial.

O objetivo é permitir responder perguntas como:
	•	Quais setores possuem maior risco ergonômico?
	•	Quais cargos concentram maior exposição?
	•	Quantos dias foram perdidos por afastamentos?
	•	Quais planos de ação estão atrasados?
	•	O risco ergonômico está diminuindo ao longo do tempo?

⸻

Dashboards

A plataforma é composta por três dashboards principais, cada um com uma tela dedicada.

Diagnóstico Ergonômico

Análise da exposição ergonômica na organização.

Principais visualizações:
	•	distribuição de risco ergonômico
	•	classificação por setor
	•	classificação por cargo
	•	evolução temporal do risco
	•	detalhamento analítico de riscos

Indicadores:
	•	empregados avaliados
	•	empregados expostos
	•	risco médio da unidade
	•	número de planos de ação

Tabela analítica:

| Setor | Cargo | Classificação | Grupo de risco | Subgrupo | % exposição | Plano de ação | Status |

⸻

Saúde Ocupacional

Monitoramento de afastamentos e absenteísmo ocupacional.

Principais métricas:
	•	dias perdidos
	•	número de afastamentos
	•	média de dias por afastamento
	•	principais diagnósticos (CID)

Visualizações:
	•	dias perdidos por setor
	•	dias perdidos por cargo
	•	distribuição de CID
	•	evolução temporal de afastamentos

Tabela analítica:

| Matrícula | Cargo | Setor | CID | Afastamento | Retorno | Dias perdidos |

⸻

Gestão do Plano de Ação

Acompanhamento das ações corretivas relacionadas aos riscos identificados.

Indicadores:
	•	planos iniciados
	•	planos concluídos
	•	planos próximos do prazo
	•	planos vencidos

Visualizações:
	•	status dos planos de ação
	•	planos por prioridade
	•	evolução dos planos ao longo do tempo

Tabela analítica:

| Plano | Setor | Cargo | Responsável | Prazo | Prioridade | Status |

⸻

Arquitetura do Sistema

O projeto separa duas camadas principais:

Camada de Dashboard

Responsável por:
	•	visualização
	•	análise
	•	interação com dados
	•	filtros analíticos

Tecnologias:
	•	Angular
	•	Tailwind
	•	AG Charts
	•	AG Grid
	•	Lucide Angular

⸻

Camada de Dados e Domínio

Responsável por:
	•	ingestão de dados
	•	normalização
	•	modelagem de domínio
	•	preparação analítica

Componentes:
	•	DTOs de importação
	•	normalizers
	•	value objects
	•	aggregates

Os dados atualmente são ingeridos a partir de arquivos CSV estruturados, podendo futuramente integrar com:
	•	bancos de dados
	•	APIs corporativas
	•	ferramentas de BI

⸻

Stack Tecnológica

Frontend
	•	Angular
	•	TypeScript (strict mode)
	•	Tailwind CSS

Data Visualization
	•	AG Charts
	•	AG Grid

Data Ingestion
	•	Papa Parse

Arquitetura
	•	Feature-Based Architecture
	•	Domain modeling com aggregates e value objects

⸻

Estrutura do Projeto

src/

features
 └ dashboard
     ├ ergonomics-diagnosis
     ├ occupational-health
     └ action-plan-management

shared
 ├ value-objects
 ├ normalizers
 ├ dto
 └ utilities

data
 ├ csv-import
 └ datasets


⸻

Fluxo de Dados

CSV datasets
      ↓
Papa Parse
      ↓
DTOs de Importação
      ↓
Normalizers
      ↓
Value Objects
      ↓
Aggregates
      ↓
Dashboards


⸻

Inicialização do Projeto

Criar o projeto Angular:

ng new mestriax-ergonomics-dashboard \
--style=tailwind \
--ssr=false \
--ai-config=windsurf \
--skip-install \
--strict=true

Instalar dependências:

npm install

Bibliotecas principais:

npm install papaparse
npm install ag-grid-angular ag-grid-community
npm install ag-charts-angular ag-charts-community
npm install -D @types/papaparse

Executar o projeto:

ng serve


⸻

Roadmap

Curto prazo
	•	ingestão completa dos datasets CSV
	•	filtros cruzados entre gráficos
	•	integração total AG Grid + AG Charts
	•	normalização dos datasets

Médio prazo
	•	exportação de relatórios
	•	correlação risco × afastamentos
	•	geração automática de insights

Longo prazo
	•	integração com Power BI
	•	integração com Looker Studio
	•	suporte multiempresa
	•	plataforma SaaS de ergonomia

⸻

Objetivo do Projeto

Este projeto demonstra como consultorias ergonômicas podem evoluir de planilhas operacionais para plataformas analíticas completas, permitindo:
	•	maior escala
	•	consistência de dados
	•	acompanhamento contínuo de risco
	•	gestão estruturada de ações corretivas

⸻

Licença

MIT License