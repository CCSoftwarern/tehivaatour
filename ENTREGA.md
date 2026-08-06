# Checklist de entrega para cliente (site de agência de viagens)

Processo para montar o site de um novo cliente em ~30–40 min. Cada cliente tem
seu próprio Supabase e seu próprio deploy na Vercel — o código é o mesmo.

> Pré-requisito: este repositório publicado no seu GitHub (ou o seu fork, se
> quiser repositórios separados por cliente).

## 1. Supabase (10 min)

1. Crie o projeto em supabase.com (região próxima do cliente).
2. Em **SQL Editor**, rode o script completo do `SUPABASE_SETUP.md`.
3. Em **Authentication → Users → Add user**, crie o admin do cliente
   (e-mail/senha que você vai entregar a ele).
4. Em **Storage**, confirme que o bucket `imagens` existe e está **Public**.
   - Se não estiver: **Storage → New bucket** → nome `imagens` → **Public: ON**.
5. Guarde a **Project URL** e a **anon key** (Project Settings → API).

## 2. Deploy na Vercel (10 min)

1. Acesse vercel.com → **Add New → Project** → importe o repositório.
2. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` → URL do projeto
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon key
3. **Deploy** e aguarde o build.
4. Em **Settings → Domains**, adicione o domínio do cliente (ou use o
   subdomínio `.vercel.app` temporário).

## 3. Configuração inicial no admin (10 min)

Entre em `/pt/admin` com o e-mail/senha criados e configure:

- [ ] **Configurações → Identidade**: nome do site, logo, WhatsApp, e-mail,
      telefone, endereço, Instagram/Facebook.
- [ ] **Configurações → Crédito no rodapé**: ative e coloque seu nome/link
      (gera indicações).
- [ ] **Configurações → Cores**: aplique as cores da marca do cliente.
- [ ] **Configurações → Hero e Sobre**: textos de apresentação.
- [ ] **Banner**: envie 2–3 imagens do banner principal.
- [ ] **Logos do rodapé**: operadoras e certificados do cliente.
- [ ] **Serviços**: diferenciais (o padrão já vem preenchido se o cliente
      tiver rodado o seed — caso contrário, cadastre).
- [ ] **Pacotes / Promoções**: cadastre os produtos do cliente.
- [ ] **Editor de arte**: teste a criação de um post de pacote e a exportação
      em PNG (botão "Copiar" cola direto no WhatsApp).
- [ ] **Orçamentos**: gere um orçamento de teste (com item com imagem) e confira
      o PDF (cabeçalho, marca d'água, valor total e rodapé) e o link gerado.

## 4. Entrega ao cliente (10 min)

- [ ] Envie o link do site e o acesso do admin (`/pt/admin/login`).
- [ ] Explique o essencial: como criar pacote/promoção, trocar banner e cores.
- [ ] Grave um vídeo curto (2–3 min) mostrando o painel — evita dúvidas.

## 5. Checklist de qualidade (antes de cobrar)

- [ ] Site abre em `/pt` e `/en` (troca de idioma ok).
- [ ] WhatsApp flutuante abre com o número certo.
- [ ] Formulário de contato entrega mensagem no admin (teste 1 envio).
- [ ] Promoção criada aparece na home; com vencimento passado, some.
- [ ] Imagens de banner e logos carregam.
- [ ] Logo do cliente aparece no cabeçalho.
- [ ] Cores/credito do rodapé conforme combinado.
- [ ] Contador de visitas no dashboard incrementa (acessar o site uma vez).
- [ ] Orçamento em PDF abre no navegador/mobile e mostra marca d'água + total.

## Faturamento sugerido

- Setup: R$ 1.500–3.500
- Manutenção mensal: R$ 150–400 (domínio, suporte e pequenas edições)
- Anual com desconto (ex: 12 → 10 mensalidades)
