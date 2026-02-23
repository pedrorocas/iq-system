# 🧠 Sistema de Teste de QI — v3

## Estrutura
```
iq-system/
├── backend/          Node.js + Express + Prisma
├── frontend/         Next.js 14 + Tailwind
├── SUPABASE_SETUP.sql  → Rode no SQL Editor do Supabase
└── README.md
```

## Deploy passo a passo

### 1. Supabase (banco + imagens)
1. SQL Editor → cole SUPABASE_SETUP.sql → Run
2. Storage → New bucket → nome: `question-images` → Public: ✅ ON
3. Settings → API → copie Project URL e service_role key
4. Settings → Database → Connection string URI (pooler 6543)

### 2. Render (backend)
- Root Directory: `backend`
- Build: `npm install && npm run build`  
- Start: `npm run start`
- Env vars:
  - DATABASE_URL → connection string do Supabase (porta 6543)
  - SUPABASE_URL → Project URL do Supabase
  - SUPABASE_SERVICE_KEY → service_role key
  - JWT_SECRET → texto longo aleatório
  - RESEND_API_KEY → chave re_...
  - FRONTEND_URL → URL da Vercel (atualizar após deploy)

### 3. Vercel (frontend)
- Root Directory: `frontend`
- Env var: NEXT_PUBLIC_API_URL → URL do Render

### 4. Atualizar FRONTEND_URL no Render
Após pegar a URL da Vercel, atualizar no Render.

## Credenciais padrão
- Email: rh@suaempresa.com.br
- Senha: admin123

## Funcionalidades
- ✅ Portal candidato: login → 60 questões (texto + imagem) → conclusão
- ✅ Portal RH: resultados, convidar candidatos, exportar CSV
- ✅ Gestão de questões: cadastrar, editar, excluir, upload de imagens
- ✅ Gabarito nunca exposto no frontend
- ✅ Teste só pode ser feito uma vez
