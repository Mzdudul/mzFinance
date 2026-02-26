# Decodificar Mensagens de Erro - Guia Completo

Quando você clica em "Continuar com Google" ou "Continuar com Apple" e recebe um erro, esta página ajuda você a entender e CORRIGIR o problema.

---

## Erro: "404 Not Found"

### O que significa?
O Supabase não conseguiu encontrar a configuração do provedor OAuth.

### Causas Comuns:
1. Google OAuth **NÃO está ativado** no Supabase
2. Apple Sign-In **NÃO está ativado** no Supabase
3. Credenciais do Supabase estão incorretas no `.env`

---

## Erro: "Acesso bloqueado / invalid_app"

### O que significa?
A requisição chegou ao Google, mas o **OAuth Client ID** usado pelo Supabase não está válido para
seu domínio/uri. O Google exibe a mensagem em português:

> "Acesso bloqueado – Solicitação desse app é inválida."

Esse erro ocorre antes de o usuário sequer ver a página de login do provedor. É típico quando:

- O **Client ID** não existe ou foi excluído.
- O Client ID não está ligado a um **OAuth consent screen** configurado e publicado.
- As **redirect URIs** autorizadas no Cloud Console não incluem
  `https://<seu-projeto>.supabase.co/auth/v1/callback` (ou outra URL usada).
- O domínio do origin/request não está listado em **Authorized domains**.

### Como Corrigir:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Selecione o projeto associado ao seu app ou crie um novo.
3. Navegue em **APIs & Services > OAuth consent screen**
   - Preencha nome do app, email de suporte e domínios autorizados (`localhost`, `supabase.co` etc).
   - Clique em **Publish** (para apps externos).
4. Vá em **APIs & Services > Credentials > Create Credentials > OAuth client ID**
   - Tipo: **Web application**.
   - Em **Authorized JavaScript origins** adicione:
     `https://<seu-projeto>.supabase.co` e `http://localhost:8080` (se usar local).
   - Em **Authorized redirect URIs** adicione:
     `https://<seu-projeto>.supabase.co/auth/v1/callback` (e o equivalente para localhost, caso necessário).
   - Crie e copie o **Client ID** e **Client Secret**.
5. Volte ao Supabase POSTO: **Authentication > Providers > Google**
   - Cole o Client ID e Secret (ou deixe em branco para usar as credenciais padrão do Supabase).
   - Certifique-se de que os **Redirect URLs** na aba “URL Configuration” incluem
     todos os seus ambientes (`http://localhost:8080/auth/callback`, `https://<seu-dominio>/auth/callback`).
   - Salve as alterações.
6. Reinicie seu servidor local (`npm run dev`) e tente o login novamente.

> 🔁 Se você quiser usar as credenciais padrão do Supabase, não precisa fazer nada no Cloud
> Console além de garantir que o provedor está habilitado; a mensagem acima não deverá mais aparecer.

---

### Como Corrigir:

**Solução 1: Ativar OAuth no Supabase**
```
1. Vá para https://supabase.com
2. Abra seu projeto
3. Vá para Authentication > Providers
4. Clique em Google → Habilitar → Save
5. Clique em Apple → Habilitar → Save
6. Reinicie: npm run dev
```

Seu `.env` tem:
```env
VITE_SUPABASE_URL=https://mcnlukftftmjcprkkmnr.supabase.co
VITE_SUPABASE_PROJECT_ID=mcnlukftftmjcprkkmnr
```

**Solução 2: Verificar Credenciais**
```
1. Abra seu `.env`
2. Verifique que VITE_SUPABASE_URL começa com https://
3. Verifique que termina com .supabase.co
4. Se estiver errado, COPIE do Supabase > Settings > API
5. Reinicie: npm run dev
```

---

## Erro: "401 Unauthorized" ou "Invalid Credentials"

### O que significa?
A credencial de acesso do Supabase está expirada ou inválida.

### Causas Comuns:
1. `VITE_SUPABASE_PUBLISHABLE_KEY` está vencido
2. Chave foi copiada incorretamente

### Como Corrigir:

```
1. Vá para Supabase > Settings > API
2. Procure por "anon/public" (Supabase Anon Key)
3. Copie a chave EXATA
4. Cole em `.env` na linha VITE_SUPABASE_PUBLISHABLE_KEY
5. Não adicione aspas a menos que o exemplo mostre
6. Reinicie: npm run dev
```

---

## Erro: "Redirect URI mismatch"

### O que significa?
A URL de redirect que o Supabase espera é DIFERENTE da que você está usando.

### Causas Comuns:
1. `Redirect URLs` do Supabase não incluem `http://localhost:8080/auth/callback`
2. Você está em uma porta diferente (3000, 5173, etc) mas não adicionou ao Supabase

### Como Corrigir:

```
1. Vá para Supabase > Authentication > Providers
2. Procure por "URL Configuration" ou "Redirect URLs"
3. Adicione TODAS estas URLs:
   - http://localhost:8080/auth/callback
   - http://localhost:3000/auth/callback
   - http://localhost:5173/auth/callback
4. Salve
5. Reinicie: npm run dev
```

---

## Aviso: "OAuth configured but missing credentials"

### O que significa?
O OAuth está ativado no Supabase MAS você não adicionou client ID/secret.

### É um Problema?
**NÃO!** Supabase fornece suas próprias credenciais padrão por segurança.

### O que Fazer:
```
1. Se você QUER usar suas próprias credenciais Google:
   - Vá para Google Cloud Console
   - Crie um projeto
   - Obtenha Client ID e Client Secret
   - Adicione em Supabase > Providers > Google
   - Salve

2. Se você QUER usar padrão Supabase:
   - Deixe em branco
   - Supabase usa seus próprios
   - Continue normalmente
```

---

## Aviso: "localhost not configured for production"

### O que significa?
Você está em desenvolvimento local mas Supabase quer um domínio real.

### O que Fazer:
```
1. Se está testando LOCAL:
   - Adicione http://localhost:8080/auth/callback em Redirect URLs
   - Funciona normal

2. Se quer fazer PRODUÇÃO:
   - Adicione https://seu-dominio.com/auth/callback
   - Adicione em Supabase > Redirect URLs
   - Faça deploy
   - Testa em produção
```

---

## Sucesso: "Redirecting to Google..."

### O que significa:
OAuth está funcionando. A página vai redirecionar para Google.

### O que Fazer:
```
1. Espere ser redirecionado para Google Login
2. Faça login com sua conta Google
3. Google redireciona de volta para seu app
4. Você será autenticado
```

---

## Como Ver os Erros Exatos

### Passo 1: Abrir Console do Navegador
```
Pressione: F12
Ou: Ctrl+Shift+I
Ou: Clique direito > Inspecionar > Console
```

### Passo 2: Procure por Mensagens em VERMELHO (erros)

Exemplo de erro que você pode ver:
```
OAuth sign-in error (google): 404 Provider not enabled
```

### Passo 3: Copie a Mensagem

Mensagem: `404 Provider not enabled`

A maioria dos erros tem uma das seguintes palavras:
- `404` = Provedor não ativado
- `401` = Credenciais inválidas
- `mismatch` = Redirect URI errado
- `not found` = Configuração não existe
- `invalid` = Valor incorreto

---

## 📋 Checklist de Debug

Quando algo não funciona:

- [ ] **Abri o Supabase e confirmei:**
  - [ ] Google OAuth está ATIVADO (toggle ON)
  - [ ] Apple está ATIVADO (toggle ON)
  - [ ] `http://localhost:8080/auth/callback` está em Redirect URLs

- [ ] **Verifiquei o `.env`:**
  - [ ] `VITE_SUPABASE_URL` começa com `https://`
  - [ ] `VITE_SUPABASE_URL` termina com `.supabase.co`
  - [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` tem valor
  - [ ] `VITE_SUPABASE_PROJECT_ID` tem valor

- [ ] **Reiniciei o servidor:**
  - [ ] `npm run dev` rodando
  - [ ] Console mostra "VITE v..."
  - [ ] Server em `http://localhost:8080`

- [ ] **Testei no navegador:**
  - [ ] Abri `http://localhost:8080` (não localhost:5173)
  - [ ] Cliquei em "Continuar com Google"
  - [ ] Abri F12 > Console para ver erro

- [ ] **Procurei ajuda:**
  - [ ] [FIX_404_LOGIN.md](./FIX_404_LOGIN.md) - Solução rápida
  - [ ] [GUIA_VISUAL_OAUTH.md](./GUIA_VISUAL_OAUTH.md) - Guia com imagens
  - [ ] [OAUTH_SETUP.md](./OAUTH_SETUP.md) - Guia completo

---

## 💡 Dicas de Debug Avançado

Se você é desenvolvedor e quer ver EXATAMENTE o que está acontecendo:

### Ativar Debug Mode
Na página de login, existe um botão:
```
Debug Mode: OFF (Click to enable)
```

Clique nele. Você verá no Console:
```
=== SUPABASE OAUTH DIAGNOSTIC ===

1. Environment Variables:
  VITE_SUPABASE_URL: SET
  VITE_SUPABASE_PUBLISHABLE_KEY: SET
  VITE_SUPABASE_PROJECT_ID: SET

2. Supabase Connection:
  Can connect to Supabase: YES
  Current session: NO SESSION

3. OAuth Configuration Status:
  IMPORTANT: Check your Supabase project settings:
     1. Go to https://supabase.com
     2. Open project: mcnlukftftmjcprkkmnr
     ...
```

### Ver Requisições de Rede
1. Abra F12
2. Vá para aba **Network**
3. Clique em "Continuar com Google"
4. Procure por requisições para `supabase.co`
5. Clique nela para ver a resposta
6. Se ver `404`, OAuth não está ativado

---

## 🎯 Solução Rápida (Se Perdido)

Se tá confuso, faça EXATAMENTE isso:

```bash
# 1. Abra o arquivo FIX_404_LOGIN.md
cat FIX_404_LOGIN.md

# 2. Siga os 4 passos
# (ativar Google, Apple, URL Config, testar)

# 3. Se ainda não funcionar, abra console F12
# e copie a mensagem de erro

# 4. Procure a mensagem aqui neste arquivo
```

---

## 📞 Sumário Rápido de Erros

| Erro | Causa | Solução |
|------|-------|---------|
| **404 Not Found** | OAuth não ativado | Ative no Supabase |
| **401 Unauthorized** | Chave inválida | Copie chave nova do Supabase |
| **Redirect mismatch** | URL não autorizada | Adicione em Redirect URLs |
| **blank page** | Redirecionando | Espere 2 segundos |
| **Nada acontece** | JS error | Abra Console (F12) |

---

## Próximos Passos Quando Funcionar

Quando OAuth estiver funcionando:
1. Você será redirecionado para Google/Apple
2. Após autenticar, volte ao app
3. O dashboard abrirá automaticamente
4. Você estará autenticado

---

**Última Atualização**: 24 de Fevereiro de 2026  
**Problema**: Erro 404 OAuth  
**Status**: Guia Completo
