# AgroAlert v2 — PBL Fase 7

**Equipe:** Pedro Henrique da Silva Valandro · Lucas Paz dos Santos Lima · João Pedro Soares Rocha ·
Gabriel Rocha Freitas · Mateus Bomfim Nascimento

> **Venda sua colheita antes que ela vire perda.** Ciclo semanal sob encomenda: agricultores
> familiares de hortifrúti natural colhem só o que foi vendido e entregam num ponto de retirada
> do bairro, com frete dividido entre vizinhos e pagamento protegido.

Protótipo **front-end** em **Next.js 16 (App Router) + TypeScript**, a partir do site React/Vite
da Fase 6, mantendo a mesma identidade visual. O modelo de negócio foi revisto nesta fase — veja
[`../docs/modelo-negocio.md`](../docs/modelo-negocio.md).

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de produção (+ checagem de tipos)
npm run typecheck  # só o TypeScript
npm run lint       # oxlint
```

## Funcionalidades (e onde ver no código)

| Rota | O que faz | Conteúdo da Fase 7 |
| --- | --- | --- |
| `/` | Home focada em quem compra: proposta de valor, ciclo semanal com **contagem regressiva** até o fechamento (qua 20h), **ofertas em destaque**, selos, **meta do piloto** com progresso calculado dos pedidos, FAQ, contato validado | Server + Client Components |
| `/produtores` | Página de quem vende: **comparador de renda** (atravessador × por conta própria × AgroAlert), o que o painel faz, planos (produtor, ponto, indústria) e como entrar | Server Component com ilhas client |
| `/ofertas` | **Vitrine** com busca, filtros (categoria, selo, classe, associação, produtor via `?produtor=`) e ordenação; esqueleto de carregamento e tela de erro com "tentar de novo" | `useEffect` + `fetch('/api/ofertas')`, `useSearchParams` |
| `/ofertas/[id]` | Detalhe da oferta, perfil do produtor (selo, taxa de cumprimento, hub), prazo de reclamação, adicionar à cesta | Rota dinâmica, `useParams`, `notFound()` |
| `/cesta` | Cesta, ponto de retirada, **assinatura −5%**, aceite da regra de não retirada, **Pix simulado** (QR) | Context + localStorage |
| `/pedidos` | Linha do tempo do pedido, **QR code de retirada**, confirmar recebimento, **reclamação no prazo (24h/48h)**, estorno de falta, confirmação automática | Rota protegida, *union types* |
| `/painel` | **Painel do produtor**: CRUD de ofertas com validação, **alerta de clima** (Open-Meteo) que leva à ação, **romaneio** com registro de falta, **extrato** retido × liberado | Rota protegida, `fetch` externo |
| `/ponto` | **Painel do ponto**: QR 1 (recebimento) e QR 2 (retirada), encerrar retirada → doação | Estado global |
| `/mapa` | Mapa Leaflet (reaproveitado da F6): pontos de retirada, hubs e produtores, busca por bairro (Nominatim), "Perto de mim", rota ponto↔hub, clima | `next/dynamic` com `ssr: false`, `fetch('/api/mapa')` |
| `/entrar` | Login **simulado** (consumidor, produtor ou ponto) | `AuthContext` + localStorage |
| `/como-funciona`, `/privacidade` | Ciclo completo e política LGPD atualizados para o modelo v2 | Rotas estáticas (Server Components) |
| 404 | Página não encontrada | `not-found.tsx` |
| `/api/ofertas`, `/api/mapa` | "Back-end" do protótipo (route handlers) | Route Handlers do Next |

**Modo demonstração** (rodapé, discreto): fixa a fase do ciclo (pedidos abertos, colheita,
retirada, encerrado) para gravar o Pitch Vídeo em qualquer dia, permite simular a passagem do
tempo após a retirada e restaura os dados de demonstração.

## Fluxo para testar (ou gravar o PV)

1. **Entrar** como consumidor (a conta *Marina Costa* já tem o pedido de exemplo AG-1907) →
   **Ofertas** → filtrar "Feio mas bom" → adicionar itens.
2. **Cesta** → escolher ponto → marcar assinatura → aceitar a regra → **Pagar com Pix** (simulado).
3. Rodapé → **Modo demonstração** → fase *Colheita*. **Entrar** como produtor → **Painel** →
   *Alerta de clima* / *Romaneio* (registrar falta) / *Extrato*.
4. Modo demonstração → fase *Retirada*. **Entrar** como ponto (Empório Grão Natural) →
   QR 1 e QR 2 com o código do pedido.
5. **Entrar** como consumidor → **Meus pedidos** → confirmar recebimento (ou *Simular +24h*).

## Estrutura

```
src/
├── app/                      # App Router: cada pasta é uma rota
│   ├── layout.tsx            # layout raiz (Navbar, Footer, Providers)
│   ├── page.tsx              # Home
│   ├── ofertas/ · ofertas/[id]/ · cesta/ · pedidos/ · painel/ · ponto/
│   ├── produtores/ · mapa/ · entrar/ · como-funciona/ · privacidade/ · not-found.tsx
│   └── api/ofertas/route.ts · api/mapa/route.ts
├── components/               # componentes + CSS co-localizado (herdado da F6)
├── context/                  # AuthContext, CicloContext, LojaContext
├── hooks/                    # usePersistente (localStorage), useAnimaScroll, useAgora
├── lib/                      # taxas, ciclo semanal, pedidos, clima/geo (Open-Meteo, Nominatim)
├── data/                     # catálogo fictício do piloto + rótulos
├── styles/                   # CSS das páginas
└── types/                    # tipos de domínio (Oferta, Pedido, StatusPedido...)
```

## Decisões técnicas

- **Next.js App Router no lugar da navegação por estado** (`navegarPara`) da F5/F6: URLs reais e
  compartilháveis (`/ofertas/o3`), página 404 e rotas protegidas.
- **TypeScript estrito**: os estados do pedido são um *union type*
  (`'pago' | 'no-ponto' | 'retirado' | ...`); `Record<Tipo, string>` obriga cada valor a ter rótulo.
- **Taxas numa fonte única** (`src/lib/taxas.ts`): planos, cesta, comparador e extrato leem daí.
- **localStorage lido só após a hidratação** (`usePersistente`): evita divergência entre o HTML do
  servidor e o do cliente.
- **Leaflet sem SSR** (`next/dynamic`): a biblioteca acessa `window`, que não existe no servidor.
- **Status derivado**: "em colheita" e a confirmação automática após o prazo são calculados a partir
  da fase do ciclo e do relógio, não salvos.

## Simulações (protótipo)

Pagamento (Pix com custódia), avisos por WhatsApp, login e banco de dados são **simulados**;
os dados ficam no navegador. Produtores, associações, pontos e ofertas são **fictícios**. Clima
(Open-Meteo) e busca de endereços (Nominatim) são consultas **reais**.

## Deploy (Vercel)

1. Suba esta pasta para um repositório no GitHub.
2. Em vercel.com → *Add New Project* → importe o repositório. O Next.js é detectado sozinho
   (build `next build`, sem variáveis de ambiente).
3. Copie a URL gerada para o PDF de entrega.

## Pendências da equipe

- [x] Deploy na Vercel: https://agroalert-delta.vercel.app (o `vercel.json` fixa o framework Next.js,
      porque o projeto na Vercel foi criado na Fase 6 com o preset Vite).
- [x] Pitch Vídeo (roteiro em `../docs/roteiro-pitch-video.md`): https://youtu.be/WpODVyVU-9I —
      link também na Home (`src/components/Hero.tsx`, `LINK_PITCH_VIDEO`).
- [ ] Gerar o PDF + ZIP de entrega:
      `python ../docs/gerar_entrega.py --deploy https://agroalert-delta.vercel.app --video https://youtu.be/WpODVyVU-9I`
      e enviar só o ZIP no portal.
