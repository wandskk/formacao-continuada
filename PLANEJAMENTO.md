# Planejamento e Especificação: Sistema de Gestão de Formações e Certificação

> **Documento Base de Desenvolvimento e Registro de Decisões**  
> Foco: Atendimento aos Itens 22 e 35 do Edital nº 7/2026 (Selo Nacional Compromisso com a Alfabetização - MEC).

---

## 1. Visão Geral do Produto

O sistema é uma plataforma web para gestão de formações continuadas da rede municipal de ensino, controlando:
1. Cadastro de cursos, turmas e inscrições (via link público ou planilha CSV/XLSX).
2. Chamada e registro de presença dinâmico via QR Code (com baixa manual para contingência).
3. Motor de monitoramento de frequência e relatórios oficiais para o MEC (Item 22).
4. Emissão automática e validação pública de certificados digitais autenticáveis (Item 35).

---

## 2. Roadmap Proposto de Execução (Faseamento)

Para garantir qualidade, entregas parciais testáveis e redução de risco, dividimos o projeto em 6 fases:

| Fase | Escopo Principal | Entregas Chave | Status |
| :--- | :--- | :--- | :---: |
| **Fase 0** | **Alinhamento & Especificação (Brainstorming)** | Documento base, decisões de arquitetura e escopo fechado | **Concluído** |
| **Fase 1** | **Setup da Arquitetura & Banco de Dados** | Next.js 15, Tailwind, Prisma, PostgreSQL (Neon), Git & Governança | **Concluído** |
| **Fase 2** | **Autenticação & Controle de Acesso (RBAC)** | Login Admin, Instrutor e Cursista (via CPF/Senha) | **Concluído** |
| **Fase 3** | **Módulo 1: Cursos, Turmas e Inscrições** | CRUD de formações, slug para auto-inscrição e importação em lote | **Concluído** |
| **Fase 4** | **Módulo 2: Presença Dinâmica & QR Code** | Sessões de aula, QR Code em tempo real, check-in e baixa manual | **Concluído** |
| **Fase 5** | **Módulo 3: Motor de Frequência & Relatórios MEC** | Cálculo de % de presença, regras de corte e exportação em PDF | **Concluído** |
| **Fase 6** | **Módulo 4: Certificação & Validação Pública** | Hash único, geração de PDF e página pública `/validar/[codigo]` | **Próxima Etapa** |

---

## 3. Matriz de Perfis e Casos de Uso

| Perfil | Ações Principais |
| :--- | :--- |
| **ADMIN (Secretaria)** | Gerencia cursos, importa professores via planilha, emite relatórios para o MEC, gerencia usuários e audita presenças/certificados. |
| **INSTRUTOR (Formador)** | Abre sessões de formação, projeta o QR Code dinâmico na tela, realiza baixa manual para cursistas sem smartphone. |
| **CURSISTA (Professor)** | Realiza auto-inscrição via link único, faz check-in lendo QR Code da sessão, consulta sua frequência e baixa certificados emitidos. |
| **PÚBLICO / MEC** | Acessa a rota pública de validação de autenticidade do certificado via código ou QR Code impresso. |

---

## 4. Requisitos Não-Funcionais & Premissas Preliminares

- **Usabilidade Mobile-First:** A tela do cursista para check-in deve ser ultra-rápida e intuitiva em smartphones de qualquer padrão.
- **Resiliência a Falhas de Conectividade:** Suporte a baixa manual imediata pelo instrutor caso o cursista esteja sem internet ou sem celular.
- **Segurança e Conformidade:** Armazenamento seguro de senhas (bcrypt/argon2), mascaramento de CPF em relatórios públicos/compartilhados e integridade dos códigos de certificação.
- **Auditoria:** Registro de data/hora exata do check-in e método utilizado (`QR_CODE` ou `MANUAL`).

---

## 5. Registro de Decisões de Arquitetura (Decision Log)

| ID | Data | Decisão | Alternativas Consideradas | Justificativa |
| :---: | :---: | :--- | :--- | :--- |
| **DEC-001** | 2026-09-21 | Adoção do método Faseado com Brainstorming estruturado antes de qualquer código | Implementação direta do código | Garantir que regras de negócio do MEC e infraestrutura atendam perfeitamente aos requisitos. |
| **DEC-002** | 2026-09-21 | Utilização do PostgreSQL gerenciado via Neon (Vercel) com credenciais no `.env` | Docker local / PostgreSQL local | Facilidade de integração com deploy na Vercel e persistência em nuvem pronta para produção. |
| **DEC-003** | 2026-09-21 | Cursistas acessam com CPF e Senha Inicial baseada na Data de Nascimento | Senhas aleatórias / Acesso sem senha | Reduz atrito em sala de aula, viabiliza importação em lote e mantém rastreabilidade por sessão. |
| **DEC-004** | 2026-09-21 | QR Code Dinâmico com token rotativo a cada 20-30s na tela do instrutor | QR Code estático / Geofencing GPS | Evita fraudes por compartilhamento de fotos em grupos de mensagens sem exigir GPS invasivo. |
| **DEC-005** | 2026-09-21 | Emissão de certificados mediante Homologação da Turma pelo Admin/Secretaria | Liberação 100% automática imediata | Permite revisão de atestados e baixas manuais antes da emissão definitiva dos certificados oficiais. |
| **DEC-006** | 2026-09-21 | Mapeamento explícito de Skills no projeto e governança estrita de commits/push | Desenvolvimento ad-hoc sem catálogo | Garante que cada módulo siga padrões de especialistas com rastreabilidade no Git. |

---

## 6. Histórico e Registro de Alinhamento (Brainstorming)

### Definições Consolidadas:
1. **Banco de Dados & Infra:** PostgreSQL gerenciado no Neon (Vercel) com string de conexão no `.env`.
2. **Credenciais dos Cursistas:** Acesso via CPF com senha inicial padrão sendo a Data de Nascimento (facilita importação via CSV/XLSX e auto-inscrição).
3. **Presença Anti-Fraude:** QR Code dinâmico/rotativo (intervalo de 20-30s) na tela projetada pelo instrutor + contingência de baixa manual.
4. **Homologação dos Certificados:** A secretaria/admin revisa pendências e homologa a turma para liberação dos certificados em PDF com QR Code público de validação.
5. **Não-Escopo Explícito:** O sistema não é um LMS de aulas em vídeo/tarefas (como Moodle), mas sim uma ferramenta focada em gestão de presença, conformidade MEC e certificação.

---

## 7. Governança de Skills por Fase de Desenvolvimento

Para guiar todo o ciclo de desenvolvimento, adotamos a matriz de skills descrita integralmente em [SKILLS.md](./SKILLS.md):

* **Fase 1 (Setup & Banco):** `nextjs-best-practices`, `prisma-expert`, `neon-postgres`.
* **Fase 2 (Autenticação):** `auth-implementation-patterns`, `broken-authentication`.
* **Fase 3 (Cursos & Inscrições):** `tailwind-design-system`, `modern-web-guidance`, `react-patterns`.
* **Fase 4 (Presença & QR Code):** `mobile-design`, `web-design-guidelines`.
* **Fase 5 (Frequência & Relatórios MEC):** `pdf-official`, `clean-code`.
* **Fase 6 (Certificação & Validação):** `pdf-official`, `frontend-security-coder`.
* **Transversal:** `smart-git-automation`, `backend-security-coder`.

