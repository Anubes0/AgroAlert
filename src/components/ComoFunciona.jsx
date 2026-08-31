import './ComoFunciona.css'

const passos = [
    {
        numero: '01',
        titulo: 'Input via WhatsApp',
        texto: 'Envie uma mensagem de texto livre no WhatsApp: "10kg tomate, colheita hoje, R$3/kg". Sem formulários complicados.',
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
    {
        numero: '02',
        titulo: 'Processamento Inteligente',
        texto: 'Bot + Twilio API + georreferenciamento em nuvem. O sistema extrai produto, quantidade, preço, urgência e localização.',
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
            </svg>
        ),
    },
    {
        numero: '03',
        titulo: 'Alertas Instantâneos',
        texto: 'Push instantâneo para compradores cadastrados próximos. Apenas compradores no raio configurado recebem o alerta.',
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
        ),
    },
    {
        numero: '04',
        titulo: 'Fechamento P2P',
        texto: 'Direto na plataforma, logística própria. Produtor e comprador combinam entrega e pagamento diretamente.',
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
]

function ComoFunciona({ navegarPara }) {
    return (
        <section id="secao-como-funciona">

            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Passo a passo</p>
                <h2>Como Funciona</h2>
                <p>Do celular ao comprador em 4 passos simples</p>
            </div>

            <div id="grade-passos" className="anima-scroll">
                {passos.map((passo) => (
                    <article className="card-passo" key={passo.numero}>
                        <span className="numero-passo" aria-hidden="true">{passo.numero}</span>
                        <span className="icone-passo" aria-hidden="true">{passo.icone}</span>
                        <h3>{passo.titulo}</h3>
                        <p>{passo.texto}</p>
                    </article>
                ))}
            </div>

            <div id="barra-fluxo">
                <span className="ator-fluxo"><span aria-hidden="true">🌱</span> <span className="cor-verde">Produtor</span></span>
                <span aria-hidden="true">→</span>
                <span className="ator-fluxo"><span aria-hidden="true">🤖</span> <span className="cor-amber">Bot</span></span>
                <span aria-hidden="true">→</span>
                <span className="ator-fluxo"><span aria-hidden="true">🏪</span> <span className="cor-azul">Comprador B2B</span></span>
                <span aria-hidden="true">→</span>
                <span className="ator-fluxo"><span aria-hidden="true">💰</span> <span className="cor-branco">Venda</span></span>
            </div>

            <div className="centralizar-cta">
                <button type="button" className="cta-pagina" onClick={() => navegarPara('funcionamento')}>
                    Ver funcionamento detalhado do processo →
                </button>
            </div>

        </section>
    )
}

export default ComoFunciona
