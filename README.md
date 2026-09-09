# ReUse — Primeira Sprint

Aplicativo mobile do **ReUse**, plataforma voltada à economia sustentável, reutilização de produtos e consumo consciente. Esta é a primeira fase do projeto, focada no primeiro contato do usuário com o produto.

---

## Contexto da Sprint

Nesta Sprint inicial, o objetivo foi criar a **base do aplicativo mobile** do ReUse, com foco em:

- Organização da interface
- Uso correto de componentes do React Native
- Apresentação clara da proposta do produto

O desafio priorizou **clareza, organização e coerência** da interface, sem complexidade técnica desnecessária.

---

## O que foi desenvolvido

- **Tela inicial (Home)** com header branco, logo ReUse em verde, banner em largura total (100%) com título, subtítulo e botão "Saber mais" centralizados
- **Conteúdo principal** ocupando 80% da largura da tela, centralizado (10% de margem de cada lado)
- **Seções:** "O problema que enfrentamos", "O que você pode reutilizar no ReUse", "O que você ganha com o ReUse", "Como funciona em 3 passos"
- **Cards em grid** (2 colunas em telas largas, 1 em mobile) com emoji, título e descrição — inspirados em layout de sites institucionais
- **Segunda tela (Sobre o projeto)** com missão, como funciona, impacto e próximos passos; acesso pelo botão "Saber mais" ou "Saber mais sobre o projeto"
- **Navegação** entre telas com React Navigation (Stack)
- **Componentes reutilizáveis:** `Logo`, `SectionCard`, `PrimaryButton` em `src/components/`
- **Estilização:** StyleSheet + NativeWind (Tailwind); tema de cores e sombras em `src/theme/`

---

## Decisões de interface e organização

1. **Header**  
   Fundo branco com logo (selo "R" + texto "ReUse") em verde, para leitura clara e identidade visual.

2. **Banner**  
   Faixa verde em 100% da largura; texto e botão centralizados para destaque da proposta sem poluir a tela.

3. **Largura do conteúdo**  
   Bloco principal em 80% da largura e centralizado, deixando o layout respirar e parecer um site em desktop.

4. **Cards**  
   Grid de cards brancos com borda leve e sombra; emoji no topo (👕 🛋️ 📱 📚 🌱 💰 🤝), título em negrito e descrição em cinza, com bom espaçamento entre eles.

5. **Cores**  
   Verde principal `#0D5C3D`, fundos claros e branco; blocos de destaque em verde bem claro (`#E8F5F0`).

6. **Acessibilidade**  
   Uso de `accessibilityLabel` e `accessibilityRole` nos botões.

---

## Estrutura do projeto

```
reUse/
├── App.tsx                 # Entrada: navegação (Stack), Logo no header
├── global.css              # Diretivas Tailwind (NativeWind)
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
├── src/
│   ├── components/
│   │   ├── Logo.tsx        # Logo para header (variante clara/escura)
│   │   ├── SectionCard.tsx
│   │   ├── PrimaryButton.tsx
│   │   └── index.ts
│   ├── navigation/
│   │   └── types.ts        # Tipos das rotas (Home, About)
│   ├── screens/
│   │   ├── HomeScreen.tsx  # Banner 100%, conteúdo 80%, cards em grid
│   │   └── AboutScreen.tsx
│   └── theme/
│       ├── colors.ts
│       └── shadows.ts      # Sombras para cards (iOS/Android)
├── package.json
├── tsconfig.json
└── README.md
```

---

## Como rodar

Requisitos: **Node.js** e **npm**.

```bash
npm install
npm start
```

Depois: **Expo Go** no celular (escanear QR code) ou:

- `npm run android`
- `npm run ios` (macOS)
- `npm run web`

---

## Tecnologias

- React Native (Expo SDK 55)
- TypeScript
- React Navigation (native-stack)
- NativeWind (Tailwind CSS)
- expo-linear-gradient (opcional, não usado no layout atual)

---

## Versão Web (Next.js + Prisma + PostgreSQL)

Este repositório também contém a versão web da plataforma, em [web/](web/),
construída com Next.js e integrada a um banco PostgreSQL via Prisma ORM.
Veja [web/README.md](web/README.md) para detalhes das telas, do uso do
Prisma e das tabelas do banco.

---

## Próximos passos (fora desta Sprint)

- Backend, APIs e persistência
- Autenticação de usuários
- Animações e microinterações

---

## Entrega

- **Repositório:** código-fonte e este README no GitHub (público)
- **PDF:** contextualização do problema, decisões de UI, prints da aplicação e link do repositório
