# Configuração do Resend para Emails do LarDia

Guia passo a passo para configurar o envio de emails transacionais (confirmação de conta, magic link, reset de senha) via Resend + Supabase.

---

## 1. Adicionar domínio no Resend

1. Acesse [resend.com/domains](https://resend.com/domains)
2. Clique em **Add Domain**
3. Digite: `lardia.com.br`
4. O Resend vai mostrar registros DNS para adicionar

## 2. Configurar DNS

O Resend vai pedir os seguintes registros no DNS do `lardia.com.br`:

| Tipo | Nome | Valor | Notas |
|------|------|-------|-------|
| **TXT** (DKIM) | `resend._domainkey.lardia.com.br` | _(valor fornecido pelo Resend)_ | Adicionar como está |
| **TXT** (SPF) | `lardia.com.br` | `v=spf1 include:amazonses.com include:_spf.improvmx.com ~all` | ⚠️ **Você já tem SPF do ImprovMX!** Não crie um novo registro — edite o existente e adicione `include:amazonses.com` antes do `~all` |
| **CNAME** (DKIM) | _(fornecido pelo Resend)_ | _(fornecido pelo Resend)_ | Pode ter 1-3 registros CNAME |

### ⚠️ Importante sobre SPF

Você já tem um registro SPF para o ImprovMX. O DNS só permite **um** registro SPF por domínio. Então em vez de criar um novo, **edite o existente**:

**Antes:**
```
v=spf1 include:_spf.improvmx.com ~all
```

**Depois:**
```
v=spf1 include:amazonses.com include:_spf.improvmx.com ~all
```

O `include:amazonses.com` é o que o Resend usa (eles enviam via Amazon SES).

Depois de adicionar os registros, volte ao Resend e clique em **Verify**. Pode levar alguns minutos.

## 3. Criar API Key com acesso completo

A key atual (`re_fv11mEnt...`) é **send-only** — serve para enviar emails do app, mas o Supabase precisa de SMTP que requer **full access**.

1. Acesse [resend.com/api-keys](https://resend.com/api-keys)
2. Clique em **Create API Key**
3. Nome: `lardia-supabase-smtp`
4. Permission: **Full access**
5. Domain: `lardia.com.br`
6. Copie a key gerada (começa com `re_`)
7. **Guarde bem** — ela não aparece de novo

> A key antiga de send-only continua funcionando para os emails do app (welcome, DAE reminder, etc.). A nova é só para o SMTP do Supabase.

## 4. Configurar SMTP no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione o projeto **LarDia**
3. Vá em **Authentication → Email → SMTP Settings**
4. Ative **Enable Custom SMTP**
5. Preencha:

| Campo | Valor |
|-------|-------|
| **SMTP Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | _(a API key full-access que você criou no passo 3)_ |
| **Sender email** | `noreply@lardia.com.br` |
| **Sender name** | `LarDia` |

6. Clique em **Save**

## 5. Personalizar templates de email no Supabase

1. No Supabase Dashboard, vá em **Authentication → Email Templates**
2. Você verá 3 templates editáveis:
   - **Confirm signup** — email de confirmação de conta
   - **Magic link** — email de login sem senha
   - **Reset password** — email de redefinição de senha
3. Para cada um, copie o **Subject** e o **Body (HTML)** dos arquivos na pasta `docs/email-templates/`:
   - `confirmation.html` → Confirm signup
   - `magic-link.html` → Magic link
   - `password-reset.html` → Reset password

### Variáveis disponíveis nos templates do Supabase

- `{{ .ConfirmationURL }}` — link de confirmação/ação
- `{{ .Email }}` — email do usuário
- `{{ .SiteURL }}` — URL do site configurada no Supabase

## 6. Testar

Depois de tudo configurado:

1. Crie uma conta nova em [lardia.com.br/signup](https://lardia.com.br/signup)
2. Verifique se o email chega de `noreply@lardia.com.br`
3. Teste o magic link em [lardia.com.br/login](https://lardia.com.br/login)
4. Verifique que o link redireciona para `lardia.com.br/auth/callback`

---

## Resumo das credenciais

| O quê | Onde usar |
|-------|----------|
| API Key **send-only** (`re_fv11mEnt...`) | `.env` do app (`RESEND_API_KEY`) — para emails do app |
| API Key **full-access** (nova) | Supabase SMTP Settings — para emails de auth |
