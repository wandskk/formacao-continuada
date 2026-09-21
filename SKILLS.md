# Mapeamento Oficial de Skills para o Projeto

> **Diretriz de Desenvolvimento:** Este documento lista todas as *skills* que devem ser consultadas e aplicadas ativamente como base de conhecimento, padrões de código e boas práticas em cada etapa do desenvolvimento da plataforma **Formação Continuada** (Selo Alfabetização MEC).

---

## 1. Quadro Geral de Skills por Fase

| Fase | Módulo / Escopo | Skills Chave a Consultar | Finalidade no Projeto |
| :--- | :--- | :--- | :--- |
| **Geral / Contínua** | Versionamento e Commits | `smart-git-automation`, `git-workflow` | Commits atômicos, agrupamento inteligente e push seguro sem expor `.env`. |
| **Geral / Contínua** | Qualidade e Segurança | `clean-code`, `backend-security-coder`, `systematic-debugging` | Clean code, validações de input defensivas e rastreamento de falhas. |
| **Fase 1** | Setup & Banco de Dados | `nextjs-best-practices`, `prisma-expert`, `neon-postgres`, `postgres-best-practices` | Setup Next.js App Router, schema Prisma com pooler Neon, singleton do cliente. |
| **Fase 2** | Autenticação & RBAC | `auth-implementation-patterns`, `broken-authentication`, `nextjs-app-router-patterns` | Autenticação por CPF + senha (nascimento), proteção de rotas `/admin`, `/instrutor`, `/cursista`. |
| **Fase 3** | Cursos & Inscrições | `tailwind-design-system`, `modern-web-guidance`, `react-patterns` | CRUD de cursos, slug público `/inscricao/[slug]` e importação em lote CSV/XLSX (`papaparse`/`xlsx`). |
| **Fase 4** | Presença & QR Code | `mobile-design`, `web-design-guidelines`, `react-best-practices` | Interface mobile-first para scanner e check-in, token dinâmico rotativo (20-30s) e baixa manual. |
| **Fase 5** | Motor de Frequência & MEC | `pdf-official`, `clean-code`, `nextjs-best-practices` | Cálculo exato de % de carga horária, regras de corte do Edital e geração do Relatório MEC (Item 22). |
| **Fase 6** | Certificação & Validação | `pdf-official`, `frontend-security-coder`, `mobile-design` | Emissão de certificados em PDF com ementa no verso, hash SHA-256 e rota pública `/validar/[codigo]`. |

---

## 2. Detalhamento e Regras de Cada Skill

### 2.1. `smart-git-automation` & `git-workflow`
* **Quando usar:** Ao finalizar cada bloco de alteração ou feature.
* **Regras obrigatórias:**
  1. Nunca commitar credenciais confidenciais (`.env`), tokens de banco ou senhas.
  2. Commitar alterações com mensagens padronizadas no formato convencional (`feat:`, `fix:`, `docs:`, `chore:`).
  3. Realizar `git push origin main` a cada etapa concluída para manter o repositório remoto sempre sincronizado.

### 2.2. `nextjs-best-practices` & `nextjs-app-router-patterns`
* **Quando usar:** Em toda a arquitetura de páginas, layouts, rotas de API e Server Actions.
* **Regras obrigatórias:**
  1. Componentes são **Server Components por padrão**. Usar `'use client'` estritamente onde houver interatividade (formulários, scanners de QR, hooks de estado).
  2. Isolamento de layouts por perfil de usuário via Route Groups: `(admin)`, `(instrutor)`, `(cursista)`, `(public)`.
  3. Validação de todos os dados recebidos via **Zod** antes de qualquer operação no banco.

### 2.3. `prisma-expert`, `neon-postgres` & `postgres-best-practices`
* **Quando usar:** Na modelagem de dados, migrações e consultas ao PostgreSQL.
* **Regras obrigatórias:**
  1. Configurar datasource com `url = env("DATABASE_URL")` (pooler) e `directUrl = env("DATABASE_URL_UNPOOLED")` (para migrations Neon).
  2. Implementar cliente Prisma singleton em `src/lib/prisma.ts` para evitar esgotamento de conexões no reload de desenvolvimento.
  3. Evitar problemas de N+1 queries utilizando `include` ou `select` explícito.
  4. Garantir índices (`@@index` ou `@unique`) em campos de busca frequente como `cpf`, `slug`, `qrToken`, e chaves compostas `[userId, courseId]`.

### 2.4. `auth-implementation-patterns` & `broken-authentication`
* **Quando usar:** No Módulo de Autenticação (Fase 2) e proteção de endpoints.
* **Regras obrigatórias:**
  1. Senhas hashadas com algoritmo robusto (bcrypt/argon2).
  2. Normalização estrita de CPF (armazenar apenas os 11 dígitos numéricos, formatando na interface).
  3. Controle estrito de papéis (RBAC): verificar se o usuário autenticado tem autorização antes de executar qualquer mutação administrativa.
  4. Sessões seguras com cookies `HttpOnly`, `SameSite` e `Secure`.

### 2.5. `mobile-design` & `tailwind-design-system`
* **Quando usar:** Na criação de todas as interfaces, com ênfase máxima nas telas do cursista e instrutor.
* **Regras obrigatórias:**
  1. Design **Mobile-First**: a experiência em celulares populares de professores precisa ser fluida, sem quebra de layout e com áreas de clique confortáveis (mínimo 44x44px).
  2. Feedback visual claro para estados de carregamento (`loading`), sucesso e erro.
  3. Aderência a paleta institucional limpa, moderna e acessível (WCAG AA).

### 2.6. `pdf-official`
* **Quando usar:** Na geração dos Relatórios MEC (Item 22) e Certificados Autenticáveis (Item 35).
* **Regras obrigatórias:**
  1. Layout vetorial profissional (A4 paisagem para certificados, A4 retrato para relatórios de presença).
  2. Mascaramento obrigatório de CPF nos relatórios públicos/compartilhados (ex: `***.123.456-**`).
  3. Inclusão de hash SHA-256 e QR Code apontando para a URL pública de validação.

### 2.7. `clean-code` & `systematic-debugging`
* **Quando usar:** Em todo o ciclo de desenvolvimento e refatoração.
* **Regras obrigatórias:**
  1. Funções curtas, com responsabilidade única e tipagem TypeScript rigorosa (sem `any`).
  2. Tratamento defensivo de erros com mensagens amigáveis para o usuário e logs estruturados para debug.
