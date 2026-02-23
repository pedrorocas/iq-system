-- ⚠️ Se você já rodou o SQL anterior, rode primeiro:
-- DROP TABLE IF EXISTS "Question", "TestSession", "Candidate", "Admin", "_prisma_migrations";

-- Tabelas
CREATE TABLE IF NOT EXISTS "Admin" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Candidate" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "accessToken" TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  "tokenUsed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "TestSession" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "candidateId" TEXT NOT NULL UNIQUE REFERENCES "Candidate"("id"),
  "startedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "finishedAt" TIMESTAMP,
  "score" INTEGER,
  "iq" INTEGER
);

CREATE TABLE IF NOT EXISTS "Question" (
  "id" SERIAL PRIMARY KEY,
  "statement" TEXT NOT NULL,
  "imageUrl" TEXT,
  "optionA" TEXT NOT NULL,
  "optionB" TEXT NOT NULL,
  "optionC" TEXT NOT NULL,
  "optionD" TEXT NOT NULL,
  "optionE" TEXT NOT NULL,
  "correctAnswer" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Admin padrão (senha: admin123)
INSERT INTO "Admin" ("id", "email", "passwordHash")
VALUES (gen_random_uuid()::text, 'rh@suaempresa.com.br', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT ("email") DO NOTHING;

-- Storage bucket para imagens das questões
-- (Isso você faz manualmente no painel do Supabase — veja instruções abaixo)
