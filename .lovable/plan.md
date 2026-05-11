## Objetivo
Reorganizar o sistema com menu lateral e adicionar gestão de projetos (PDFs) vinculados a orçamentos.

## Nova estrutura de navegação

Menu lateral fixo (colapsável) com 3 itens:
- **Dashboard** (`/`) — visão geral com estatísticas
- **Orçamentos** (`/orcamentos`) — tela atual de listagem
- **Projetos** (`/projetos`) — nova tela de gestão de PDFs

O header superior atual será mantido (logo + logout) e o trigger do sidebar fica nele.

## 1. Dashboard (nova tela inicial)

Cards de métricas:
- Total de orçamentos
- Valor total (soma de todos os orçamentos)
- Orçamentos por status (rascunho / finalizado / enviado)
- Total de projetos anexados
- Lista dos 5 orçamentos mais recentes (atalho)

## 2. Orçamentos
A tela de listagem atual move para `/orcamentos`. Sem mudanças de funcionalidade.

## 3. Projetos (nova)

Tela para upload e organização de arquivos PDF de projetos (plantas, referências, etc).

Funcionalidades:
- Upload de PDF (drag & drop + botão)
- Lista/grid de projetos com nome, data, tamanho do arquivo, orçamento vinculado
- Vincular um projeto a um orçamento existente (select)
- Visualizar PDF (abre em nova aba)
- Baixar PDF
- Excluir projeto
- Filtro/busca por nome
- Filtrar por orçamento vinculado

**Importante:** projetos NÃO entram no PDF gerado do orçamento. São apenas organização interna.

Na tela do orçamento (BudgetEditor), adicionar uma seção pequena listando os projetos vinculados, com botão "Anexar Projeto" para vincular rápido.

## Detalhes técnicos

**Backend (migration):**
- Tabela `projects`: `id`, `user_id`, `name`, `description`, `file_path`, `file_size`, `budget_id` (nullable, FK lógica), `created_at`, `updated_at`
- RLS: usuário só vê/edita os próprios
- Bucket de Storage privado `projects` com policies por `user_id` (pasta `{user_id}/{file}`)

**Frontend:**
- `src/components/AppSidebar.tsx` — menu lateral com NavLink ativo
- `SidebarProvider` envolve as rotas protegidas em `App.tsx`
- `src/pages/Dashboard.tsx` (nova) — métricas
- Renomear atual `Dashboard.tsx` para `Budgets.tsx` (rota `/orcamentos`)
- `src/pages/Projects.tsx` (nova) — CRUD de projetos
- `src/store/projectStore.ts` — funções de upload/list/delete/link
- Adicionar seção "Projetos vinculados" no `BudgetEditor`

**Stack:** mantém React + Tailwind + shadcn sidebar + Supabase Storage.
