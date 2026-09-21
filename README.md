# Sistema de Gestão de Formações e Certificação (Selo Alfabetização MEC)

## 📌 Visão Geral
Este sistema foi projetado para gerenciar formações continuadas da rede municipal de educação, focado no controle rigoroso de carga horária, registro de presença via QR Code e emissão de certificados autenticáveis. 

O objetivo de negócio é garantir a pontuação máxima nos **Itens 22 e 35 do Edital nº 7/2026 (Selo Nacional Compromisso com a Alfabetização)**[cite: 1].

---

## 🛠 Tecnologias e Stack (Recomendado)
* **Framework:** Next.js (App Router) + React
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS + shadcn/ui
* **Banco de Dados:** PostgreSQL
* **ORM:** Prisma
* **Processamento de Planilhas:** `papaparse` (CSV) ou `xlsx`
* **Autenticação:** NextAuth.js (Auth.js) ou Supabase Auth
* **Geração de PDF:** `@react-pdf/renderer` (para relatórios do MEC e Certificados)[cite: 1]
* **Geração de QR Code:** `qrcode.react`

---

## 🎯 Principais Funcionalidades (Módulos)

### 1. Gestão de Cursos, Turmas e Inscrições (Admin)
- CRUD de Formações (Nome, ementa, público-alvo, carga horária total, % mínimo de frequência para aprovação)[cite: 1].
- **Auto-inscrição por Link Único:** Geração automática de um link público e exclusivo para cada curso (Ex: `sistema.com/inscricao/alfabetizacao-2026`). O cursista acessa, preenche seus dados (ou faz login) e entra na turma.
- **Importação em Lote:** Módulo para o painel Admin fazer upload de uma planilha (`.csv` ou `.xlsx`) contendo a lista de professores. O sistema cria as contas (se não existirem) e os matricula automaticamente no curso.

### 2. Controle de Presença (Chamada Dinâmica)
- Instrutor abre uma sessão/encontro informando a data e a carga horária do dia.
- Sistema gera um **QR Code dinâmico** na tela do instrutor.
- Cursista lê o QR Code com o celular, faz login (autenticação por CPF) e confirma a presença.
- Instrutor possui opção de "Baixa Manual" para cursistas sem celular.

### 3. Motor de Monitoramento e Relatórios (Foco: Item 22)[cite: 1]
- Cálculo automático da carga horária cumprida por cursista com base nas sessões frequentadas.
- Atualização de status: *Inscrito*, *Em Andamento*, *Concluído*, *Reprovado por Falta*.
- **Relatório MEC:** Geração de PDF oficial da secretaria com lista nominal, CPF mascarado, cargo, percentual de presença e indicação de "Concluinte / Não Concluinte"[cite: 1].

### 4. Emissão e Validação de Certificados (Foco: Item 35)[cite: 1]
- Geração automática de certificado em PDF apenas para alunos com status *Concluído*[cite: 1].
- Certificado contendo: Nome, CPF, Curso, Carga Horária, Data e Ementa no verso[cite: 1].
- Geração de código hash único (Ex: `CERT-2026-X8F9A`).
- Página pública de validação via QR Code impresso no certificado (`/validar/[codigo]`)[cite: 1].

---

## 🗄️ Sugestão de Modelagem de Dados (Prisma Schema)

```prisma
model User {
  id            String       @id @default(uuid())
  name          String
  cpf           String       @unique
  email         String?      @unique
  password      String       // Hash
  role          Role         @default(CURSISTA) // ADMIN, INSTRUTOR, CURSISTA
  school        String?      // Escola de Lotação
  function      String?      // Cargo (Ex: Prof 1º e 2º ano)
  enrollments   Enrollment[]
  attendances   Attendance[]
  createdAt     DateTime     @default(now())
}

model Course {
  id            String       @id @default(uuid())
  title         String
  slug          String       @unique // Usado para o link único de inscrição: /inscricao/[slug]
  description   String?
  totalHours    Int
  minFrequency  Float        @default(75.0) // % mínima para aprovação
  status        CourseStatus @default(OPEN)
  enrollments   Enrollment[]
  sessions      Session[]
}

model Enrollment {
  id            String           @id @default(uuid())
  userId        String
  courseId      String
  status        EnrollmentStatus @default(IN_PROGRESS) // IN_PROGRESS, COMPLETED, FAILED
  user          User             @relation(fields: [userId], references: [id])
  course        Course           @relation(fields: [courseId], references: [id])
  certificate   Certificate?     // 1:1 relation
  
  @@unique([userId, courseId]) // Previne dupla inscrição do mesmo aluno no mesmo curso
}

model Session {
  id            String       @id @default(uuid())
  courseId      String
  date          DateTime
  hours         Int          // Carga horária específica deste encontro
  qrToken       String       @unique @default(uuid()) // Token dinâmico do QR Code
  isActive      Boolean      @default(true)
  course        Course       @relation(fields: [courseId], references: [id])
  attendances   Attendance[]
}

model Attendance {
  id            String       @id @default(uuid())
  sessionId     String
  userId        String
  checkInAt     DateTime     @default(now())
  method        CheckInType  @default(QR_CODE) // QR_CODE, MANUAL
  session       Session      @relation(fields: [sessionId], references: [id])
  user          User         @relation(fields: [userId], references: [id])

  @@unique([sessionId, userId]) // Previne dupla presença no mesmo encontro
}

model Certificate {
  id            String       @id @default(uuid())
  enrollmentId  String       @unique
  code          String       @unique // Hash validador
  issuedAt      DateTime     @default(now())
  enrollment    Enrollment   @relation(fields: [enrollmentId], references: [id])
}