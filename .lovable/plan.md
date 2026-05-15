# Plano de Expansão do Sistema

Vou implementar os módulos solicitados na ordem de prioridade indicada. Resumo abaixo o que será criado/alterado.

## 1. Cadastro de Clientes
- Nova tabela `clients` no backend (nome, CPF/CNPJ, telefone, e-mail, CEP, endereço, número, complemento, bairro, cidade, estado, observações), protegida por RLS por usuário.
- Página `/clientes` com listagem, busca, e formulário de cadastro/edição.
- Busca automática de endereço pelo CEP usando ViaCEP (API pública e gratuita).
- Validação de campos com Zod.

## 2. Ajustes no Orçamento
- Remover do cabeçalho do orçamento os campos de dados do cliente (nome, endereço, etc.) e o campo arquiteto(a).
- Substituir por um **seletor de cliente** (dropdown com busca) listando clientes cadastrados, mostrando nome e telefone.
- Manter apenas **Forma de pagamento**, **Prazo de entrega** e **Observações gerais** no cabeçalho.
- Adicionar coluna `client_id` na tabela `budgets`.
- O PDF gerado continuará exibindo os dados completos do cliente, mas agora puxados do cadastro vinculado.

## 3. Cadastro de Materiais
- Nova tabela `materials` (nome, unidade, preço de custo, categoria, código, descrição), com RLS.
- Página `/materiais` com:
  - **Cadastro manual**: formulário com nome, unidade (m², m linear, unidade, kg), preço de custo, categoria (chapa, ferragem, vidro, perfil, outros).
  - **Importação via XML de NF-e**: upload do arquivo XML, parser no frontend extrai os itens (descrição, unidade, quantidade, valor unitário), exibe tabela de pré-visualização para o usuário confirmar quais itens importar antes de salvar.
- Listagem com busca e filtro por categoria.

## 4. Agenda
- Nova tabela `events` (título, tipo, client_id, data/hora início, data/hora fim, observações).
- Página `/agenda` com:
  - Visualização **mensal** e **semanal** (calendário customizado em React, sem dependências pesadas).
  - Cadastro/edição de eventos via modal: título, tipo (entrega, instalação, medição, reunião), cliente vinculado, data e hora, observações.
  - Destaque visual (cor de alerta) para eventos nos próximos 3 dias.
- No **Dashboard**: novo painel "Próximos compromissos" com os eventos mais próximos.

## 5. Cards "Em breve"
- Adicionar 3 itens no menu lateral, desabilitados visualmente e com badge "Em breve":
  - Fornecedores
  - Conexão com E-mail
  - Conexão com WhatsApp
- Ao clicar, navegam para uma página simples `/em-breve/:modulo` com mensagem de "Em desenvolvimento".

## Detalhes técnicos

**Backend (Lovable Cloud):**
- Migração criando 3 tabelas: `clients`, `materials`, `events`.
- Adição de coluna `client_id uuid` em `budgets` (FK lógica para `clients`).
- RLS em todas: cada usuário só vê seus próprios registros.
- Triggers `updated_at` reutilizando `update_updated_at_column()` existente.

**Frontend:**
- Novas stores Zustand: `clientStore.ts`, `materialStore.ts`, `eventStore.ts`.
- Novas páginas: `Clients.tsx`, `Materials.tsx`, `Agenda.tsx`, `ComingSoon.tsx`.
- Atualização do `AppSidebar.tsx` com novos itens (ativos e "em breve").
- Atualização de `BudgetEditor.tsx`: remover cabeçalho de cliente, adicionar seletor (`Combobox` shadcn).
- Atualização de `pdfExport.ts`: buscar dados do cliente vinculado para imprimir no PDF.
- Atualização do `Dashboard.tsx`: painel de próximos compromissos.

**XML NF-e:**
- Parser no frontend usando `DOMParser` nativo (sem novas dependências).
- Lê tags `<det>`, `<prod>` (xProd, uCom, qCom, vUnCom, etc.) do padrão NF-e brasileiro.

## Não incluso
- Os módulos "Em breve" (Fornecedores, E-mail, WhatsApp) serão apenas placeholders.
- O módulo de Projetos permanece exatamente como está.
