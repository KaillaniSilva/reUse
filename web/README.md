# ReUse! — Versão Web (Next.js + Prisma + PostgreSQL)

Versão web da plataforma **ReUse!**, construída com **Next.js (App Router)**,
integrada a um banco de dados **PostgreSQL** via **Prisma ORM**. O objetivo
não é replicar o app mobile, e sim oferecer uma via de acesso alternativa
para as áreas mais importantes da plataforma: conhecer a proposta, navegar
pelo catálogo de itens, publicar itens e acompanhar interações.

---

## Telas desenvolvidas

| Rota | Tela | Objetivo |
|---|---|---|
| `/` | Home | Apresenta a proposta do ReUse (problema, o que pode ser reutilizado, benefícios, como funciona) com estatísticas reais vindas do banco (itens publicados, disponíveis, categorias, usuários). |
| `/sobre` | Sobre o projeto | Missão, funcionamento, impacto e próximos passos, com números de impacto consultados no banco (itens doados por categoria). |
| `/catalogo` | Catálogo | Lista os itens disponíveis, com busca por texto e filtro por categoria (via query string + Prisma `where`). |
| `/catalogo/[id]` | Detalhe do item | Mostra informações completas do item, permite favoritar, manifestar interesse (quem visita) ou ver/responder interesses recebidos (quem publicou). |
| `/login` | Entrar | Autenticação por e-mail e senha. |
| `/cadastro` | Criar conta | Cadastro de novo usuário. |
| `/publicar` | Publicar item | Formulário protegido (exige login) para publicar um novo item para doação ou troca. |
| `/perfil` | Meu perfil | Painel do usuário: itens publicados (com opção de marcar como doado/excluir), itens favoritados e interesses enviados. |

---

## Aplicação do Prisma ORM

O Prisma é usado em **todas** as telas que exibem ou alteram dados, sempre
através do client singleton em [src/lib/prisma.ts](src/lib/prisma.ts):

- **Home (`/`)**: `prisma.item.count()`, `prisma.category.count()`,
  `prisma.user.count()` para exibir estatísticas reais da plataforma.
- **Sobre (`/sobre`)**: `prisma.item.count({ where: { status: "DOADO" } })`
  e `prisma.category.findMany` com `_count` para mostrar o impacto por categoria.
- **Catálogo (`/catalogo`)**: `prisma.item.findMany` com `where` dinâmico
  (categoria + busca por texto com `contains`/`insensitive`) e `include` de
  categoria e dono do item.
- **Detalhe do item (`/catalogo/[id]`)**: `prisma.item.findUnique` com
  `include` de categoria, dono e interesses; `prisma.favorite` para
  favoritar/desfavoritar (`create`/`delete`); `prisma.interesse.create` para
  manifestar interesse e `prisma.interesse.update` para o dono aceitar/recusar.
- **Login (`/login`)**: `prisma.user.findUnique` por e-mail + comparação de
  hash de senha (bcrypt).
- **Cadastro (`/cadastro`)**: `prisma.user.create` com senha já hasheada.
- **Publicar item (`/publicar`)**: `prisma.category.findMany` (para popular o
  select) e `prisma.item.create` para salvar o novo item.
- **Perfil (`/perfil`)**: `prisma.item.findMany` (itens do usuário),
  `prisma.favorite.findMany` (favoritos) e `prisma.interesse.findMany`
  (interesses enviados), além de `update`/`delete` para gerenciar os itens
  publicados.

O schema completo está em [prisma/schema.prisma](prisma/schema.prisma) e o
script de dados iniciais em [prisma/seed.ts](prisma/seed.ts).

---

## Banco de dados (PostgreSQL)

| Tabela | Objetivo |
|---|---|
| `users` | Usuários da plataforma (nome, e-mail, senha em hash, cidade). Base da autenticação e dono das publicações. |
| `categories` | Categorias de itens (ex.: Roupas, Móveis, Eletrônicos, Livros), usadas para organizar e filtrar o catálogo. |
| `items` | Itens publicados para doação ou troca: título, descrição, condição, tipo (`DOACAO`/`TROCA`), status (`DISPONIVEL`/`RESERVADO`/`DOADO`), vinculado a um dono (`users`) e a uma categoria. |
| `favorites` | Relação N:N entre `users` e `items` que representa itens salvos/favoritados por um usuário. |
| `interesses` | Manifestações de interesse de um usuário em um item de outro usuário, com mensagem e status (`PENDENTE`/`ACEITO`/`RECUSADO`) — histórico de negociação entre as partes. |

---

## Rodando o projeto localmente

Pré-requisitos: **Node.js 20+** e um banco **PostgreSQL** acessível (local via
Docker ou um serviço como Neon/Supabase).

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# edite DATABASE_URL com a string de conexão do seu Postgres

# 3. Subir um Postgres local (opcional, via Docker)
docker compose up -d

# 4. Aplicar as migrações e popular dados de exemplo
npx prisma migrate dev
npx prisma db seed

# 5. Rodar em desenvolvimento
npm run dev
```

Usuários de exemplo criados pelo seed (senha: `reuse123`):
- `ana@reuse.com`
- `bruno@reuse.com`

### Scripts úteis

- `npm run dev` — servidor de desenvolvimento
- `npm run build` / `npm start` — build e execução em produção
- `npm run db:migrate` — aplica migrações do Prisma
- `npm run db:seed` — popula categorias, usuários e itens de exemplo
- `npm run db:studio` — abre o Prisma Studio para inspecionar o banco

---

## Tecnologias

- Next.js 16 (App Router, Server Actions, Server Components)
- TypeScript
- Tailwind CSS 4
- Prisma ORM 6 + PostgreSQL
- bcryptjs (hash de senha) + sessão via cookie assinado (HMAC)
- Zod (validação de formulários)
