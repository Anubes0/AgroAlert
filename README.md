# AgroAlert — PBL Fase 6

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

Abre em `http://localhost:5173`. Para gerar a build de produção (a pasta
`dist/`):

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
│   ├── data/
│   │   └── pontosMapa.js      # produtores e compradores de exemplo exibidos no mapa
│   ├── services/
│   │   └── mapaApi.js         # chamadas as APIs (Nominatim, Open-Meteo), alertas e distancia
│   ├── components/            # um componente por pedaço de UI, CSS ao lado (co-localizado)
│   │   ├── Navbar.jsx / .css
│   │   ├── Footer.jsx / .css
│   │   ├── BotaoTopo.jsx / .css
│   │   ├── Hero.jsx / .css
│   │   ├── ComoFunciona.jsx / .css
│   │   ├── SimuladorFinanceiro.jsx / .css
│   │   ├── MapaInterativo.jsx / .css
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

## Mapa interativo (APIs)

A seção **Mapa** da Home (`src/components/MapaInterativo.jsx`) simula a etapa de
geolocalização e matching descrita na página Funcionamento. Nenhuma das APIs exige
chave ou cadastro:

| API | Para quê |
| --- | --- |
| [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) | Mapa em si (camadas Escuro, Ruas e Satélite/Esri) |
| [Nominatim](https://nominatim.org/) | Busca de cidade → latitude/longitude (geocodificação) |
| [Open-Meteo](https://open-meteo.com/) | Clima atual + previsão de 4 dias do ponto selecionado |

O que dá pra fazer:

- clicar num pino (produtor ou comprador) ou em qualquer lugar do mapa;
- buscar uma cidade ou usar **Perto de mim** (geolocalização do navegador);
- ajustar o **raio da área de venda** (5 a 100 km, como nos planos) e ver, ordenados por
  distância (haversine), os compradores interessados no produto — ou as ofertas, se o
  ponto escolhido for um comprador;
- filtrar por tipo (produtor/comprador) e por produto;
- ver **alertas para o campo** gerados a partir da previsão (geada, calor extremo,
  chuva forte, ventania, umidade baixa), com uma recomendação de escoamento.

Os produtores e compradores são fictícios (`src/data/pontosMapa.js`); num sistema real
viriam do back-end.

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

## Entrega da Fase 6

- Nova funcionalidade: **Mapa interativo** (seção acima).
- Pitch Vídeo: https://youtu.be/Gt4CwDUw7zI (link também na Home, `src/components/Hero.jsx`).
- Deploy: https://agroalert-delta.vercel.app