## Plano de implementação

### 1. Backend (migração)

Criar tabela `profiles` (1 por usuário) com:
- **Perfil**: full_name, role_title, phone, avatar_url
- **Empresa**: company_name, legal_name, cnpj, cep, address, number, complement, neighborhood, city, state, website, instagram, logo_url
- **Preferências**: currency (default 'BRL'), date_format (default 'DD/MM/YYYY'), theme ('light'|'dark'|'system'), default_budget_validity_days (default 30)
- RLS: cada usuário só vê/edita o próprio
- Trigger `updated_at`

Criar bucket público `avatars` e bucket público `company-assets` (para logos) com políticas RLS por pasta `{user_id}/...`.

### 2. Página de Configurações (`/configuracoes`)

Layout com abas verticais à esquerda:
- **Perfil**: upload de foto (preview + remover), nome completo, empresa, cargo, telefone, e-mail (readonly + botão "Solicitar alteração" disabled com tooltip)
- **Empresa**: razão social, CNPJ, endereço completo (busca ViaCEP), upload de logo, site, Instagram
- **Segurança**: troca de senha (senha atual + nova + confirmação) com indicador visual de força; botão "Encerrar todas as sessões" (signOut global)
- **Contas conectadas**: 3 cards (E-mail, WhatsApp, Google Agenda) com status "Em breve" e botão disabled + tooltip
- **Preferências**: moeda, formato de data, tema (claro/escuro/sistema), validade padrão de orçamentos
- **Plano e assinatura**: card estático com "Plano Profissional", próxima renovação, botão "Gerenciar plano" disabled

Cada aba tem botão "Salvar alterações" com toast de feedback.

Acesso: novo item na sidebar + menu dropdown no avatar do header.

### 3. PDF de orçamento

Atualizar `pdfExport.ts` para usar `company_name`, `cnpj`, `phone` e `logo_url` do `profiles` quando preenchidos (fallback para os valores fixos atuais).

### 4. Redesign visual SAP/ERP

**Tokens (`index.css` + `tailwind.config.ts`)**:
- Paleta neutra: fundo `#F4F5F7`, cards brancos, bordas finas cinza
- Sidebar: fundo azul-marinho escuro (`#1A2332`) com texto claro, highlight sutil no ativo
- Primário: azul corporativo (`#0A6ED1` estilo SAP Fiori) substituindo o marrom atual
- Acento removido (sem dourado)
- Raio reduzido (4–6px)
- Tipografia Inter (já em uso), hierarquia ajustada

**Tema escuro**: ajustar variáveis para versão escura coerente, ativável via preferência.

**Componentes**:
- `AppSidebar`: tema escuro, ícones + labels, hover sutil
- `AppHeader` → topbar fixa branca com sombra fina, nome do módulo ativo à esquerda, avatar dropdown + bell de notificações (placeholder) à direita
- Tabelas (`Budgets`, `Clients`, `Materials`): cabeçalho cinza claro, linhas com border-bottom sutil, ações em ícones na última coluna
- Formulários: labels acima, foco azul, mensagens inline
- Badges de status: verde/amarelo/vermelho/cinza discretos
- Skeleton loaders nas listas
- Transições 200ms nos modais e dropdowns (já no shadcn)

Funcionalidade preservada em 100%; apenas estilos e o novo módulo de configurações.

### Arquivos principais

- **Migração** nova
- **Criados**: `src/pages/Settings.tsx`, `src/store/profileStore.ts`, `src/components/UserMenu.tsx`, `src/components/StatusBadge.tsx`
- **Editados**: `src/index.css`, `tailwind.config.ts`, `src/App.tsx`, `src/components/AppHeader.tsx`, `src/components/AppSidebar.tsx`, `src/lib/pdfExport.ts`, páginas de listagem (estilo de tabela), `src/contexts/AuthContext.tsx` (theme application)
