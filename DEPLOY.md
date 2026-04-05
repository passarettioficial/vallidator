# VALLIDATOR — Deploy na Vercel

## Pré-requisitos

| Serviço | Grátis? | Finalidade |
|---------|---------|-----------|
| [Vercel](https://vercel.com) | ✅ Hobby | Hospedagem Next.js |
| [Neon](https://neon.tech) ou [Supabase](https://supabase.com) | ✅ Free tier | PostgreSQL |
| [GitHub OAuth App](https://github.com/settings/developers) | ✅ Gratuito | Login social |
| [OpenAI](https://platform.openai.com) | 💳 Pay-as-you-go | Parecer IA (opcional) |
| [Resend](https://resend.com) | ✅ 3.000 e-mails/mês grátis | E-mail pós-diagnóstico (opcional) |
| [Stripe](https://stripe.com) | ✅ Sem mensalidade | Pagamentos (opcional) |

---

## Passo a Passo

### 1. Banco de Dados (Neon — recomendado)

1. Acesse [neon.tech](https://neon.tech) → crie um projeto → copie a `DATABASE_URL`
2. A URL tem este formato:
   ```
   postgresql://USER:PASSWORD@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. GitHub OAuth App

1. Acesse [github.com/settings/applications/new](https://github.com/settings/applications/new)
2. Preencha:
   - **Application name**: VALLIDATOR
   - **Homepage URL**: `https://seu-app.vercel.app`
   - **Authorization callback URL**: `https://seu-app.vercel.app/api/auth/callback/github`
3. Copie `Client ID` → `GITHUB_ID`
4. Gere um `Client secret` → `GITHUB_SECRET`

### 3. Deploy na Vercel

#### Opção A — Via CLI (recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Dentro de /workspace/vallidator_nextjs
cd vallidator_nextjs
vercel login

# Primeiro deploy (vai perguntar configurações)
vercel

# Definir variáveis de ambiente
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GITHUB_ID
vercel env add GITHUB_SECRET
# (adicione as demais conforme necessário)

# Deploy de produção
vercel --prod
```

#### Opção B — Via Dashboard

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório GitHub com o projeto `vallidator_nextjs`
3. Em **Environment Variables**, adicione todas as vars do `.env.example`
4. Clique em **Deploy**

### 4. Migrações do banco

Após o primeiro deploy, rode as migrações uma vez:

```bash
# Com DATABASE_URL configurado localmente
cd vallidator_nextjs
npx prisma migrate deploy
```

Ou adicione ao build command no `vercel.json` (já configurado):
```
npx prisma generate && npx prisma migrate deploy && next build
```

### 5. Variáveis obrigatórias

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://seu-app.vercel.app` |
| `GITHUB_ID` | ID do OAuth App |
| `GITHUB_SECRET` | Secret do OAuth App |

### 6. Variáveis opcionais (funcionalidades extras)

| Variável | Ativa |
|----------|-------|
| `OPENAI_API_KEY` | Parecer IA real (GPT-4o-mini) |
| `RESEND_API_KEY` | E-mail pós-diagnóstico |
| `STRIPE_SECRET_KEY` | Checkout de assinaturas |
| `STRIPE_WEBHOOK_SECRET` | Webhooks de pagamento |

---

## Estrutura de URLs após deploy

| URL | Descrição |
|-----|-----------|
| `/` | Landing page pública |
| `/pre-check` | Avaliação rápida (sem login) |
| `/login` | Login / Cadastro |
| `/dashboard` | Dashboard com score |
| `/calibration` | Início do diagnóstico |
| `/form` | Formulário (4 blocos) |
| `/processing` | Cálculo do score |
| `/missions` | Missões personalizadas |
| `/rankings` | Ranking de startups |
| `/failure-bank` | Banco de casos de falha |
| `/paywall` | Planos e assinaturas |
| `/settings` | Configurações da conta |

---

## Checklist de Go-Live

- [ ] `DATABASE_URL` configurada e banco criado
- [ ] `NEXTAUTH_SECRET` gerado e configurado
- [ ] `NEXTAUTH_URL` apontando para o domínio final
- [ ] GitHub OAuth App com callback URL correta
- [ ] `npx prisma migrate deploy` executado
- [ ] Primeiro deploy funcionando
- [ ] Testou fluxo completo: cadastro → diagnóstico → score
