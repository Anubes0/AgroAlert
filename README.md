# AgroAlert — PBL Fase 5

Plataforma digital (protótipo front-end) que conecta produtores rurais a compradores
via WhatsApp, reduzindo desperdício e aumentando a renda no campo.

Reescrita em **React** (Vite) a partir do site estático da Fase 4 (`../../sprint-4/`),
mantendo a mesma identidade visual e o mesmo conteúdo, só que agora como uma SPA
componentizada.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Para gerar a build de produção (a mesma pasta
`dist/` que sobe pro Vercel):

```bash
npm run build
npm run preview   # serve a build gerada, pra conferir antes do deploy
```

## Estrutura do projeto

```
agroalert/
├── index.html
├── src/
│   ├── main.jsx              # ponto de entrada
│   ├── App.jsx                # estado da SPA: qual "pagina" esta visivel + navegacao
│   ├── styles/
│   │   ├── global.css         # variaveis, reset, coisas reaproveitadas em varias secoes
│   │   └── PaginaInterna.css  # layout compartilhado por Funcionamento e Privacidade
│   ├── hooks/
│   │   └── useAnimaScroll.js  # observer do efeito "revelar ao rolar"
│   ├── components/            # um componente por pedaço de UI, CSS ao lado (co-localizado)
│   │   ├── Navbar.jsx / .css
│   │   ├── Footer.jsx / .css
│   │   ├── BotaoTopo.jsx / .css
│   │   ├── Hero.jsx / .css
│   │   ├── ComoFunciona.jsx / .css
│   │   ├── Planos.jsx / .css
│   │   ├── Impacto.jsx / .css
│   │   ├── Faq.jsx / .css
│   │   └── Contato.jsx / .css
│   └── pages/                 # as 3 "paginas" da SPA, escolhidas via estado no App.jsx
│       ├── Home.jsx           # compoe todas as secoes acima
│       ├── Funcionamento.jsx / .css
│       └── Privacidade.jsx / .css
└── public/
    └── favicon.svg
```

## Navegação (SPA com estado, sem react-router)

O capítulo da Fase 5 não ensina roteamento, então a troca entre Home / Funcionamento /
Privacidade é feita com `useState` no `App.jsx` (`navegarPara(pagina, ancoraId)`), sem
nenhuma biblioteca de rotas. Links de menu, rodapé e CTAs entre seções passam por essa
mesma função — inclusive os links profundos pra `#lgpd` e `#termos` dentro da página de
Privacidade.

## O que veio da Fase 4 e o que mudou

### Aplicando o React
Todo o site foi reconstruído com componentes (JSX, `className`, `onClick={}`,
props/estado), CSS externo por componente (`import './Componente.css'`) e imagens via
`import`, conforme o Cap. 6. Sem incremento em cima do HTML antigo — reescrita completa.

### Defeitos da Fase 4 corrigidos na migração
1. O formulário de contato **não era um `<form>`**, era uma `<div>`. Agora é um
   `<form onSubmit={}>` de verdade, com estado controlado (`useState`) pra cada campo,
   validação por campo e mensagens de erro condicionadas ao estado — não mais
   manipulação direta de `style.display` via DOM.
2. Os **15 `onclick` inline** do HTML viraram `onClick={}` nos componentes.

## Pendências

- **Funcionalidade nova**: o enunciado da Fase 5 pede uma funcionalidade além do
  Fale Conosco (ver `../README.md`, seção "Decisões"). Esta versão é só a migração
  pra React — a funcionalidade nova entra numa etapa seguinte.
- Fazer o **deploy** do build (`npm run build` → pasta `dist/`) num provedor gratuito
  (ex.: Vercel) e registrar a URL.
- Gravar e publicar o **Pitch Vídeo** (até 3 min, só a funcionalidade nova + como o
  React foi aplicado) e inserir o link na Home (`src/components/Hero.jsx`, constante
  `LINK_PITCH_VIDEO`) e no PDF de entrega.
- Montar o PDF (integrantes + link do PV + link do deploy) e o ZIP final, conforme a
  "Forma de entrega" do enunciado.
