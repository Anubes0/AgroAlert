import Link from 'next/link'
import FaixaCiclo from './FaixaCiclo'
import './ComoFunciona.css'

// os 4 passos do ciclo semanal sob encomenda (Parte 2 do modelo)
const passos = [
    {
        numero: '01',
        titulo: 'Segunda: oferta da semana',
        texto: 'Cada produtor publica o que espera colher, com quantidade máxima, selo de procedência e classe (padrão ou "feio mas bom").',
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6" />
            </svg>
        ),
    },
    {
        numero: '02',
        titulo: 'Até quarta 20h: encomenda',
        texto: 'Você monta a cesta, escolhe o ponto de retirada e paga via Pix. O valor fica protegido até você retirar o pedido.',
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
        ),
    },
    {
        numero: '03',
        titulo: 'Quinta e sexta: colheita',
        texto: 'Cada produtor recebe a lista do que colher e para quem. No sábado cedo, uma rota compartilhada leva as caixas da associação aos pontos.',
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
        ),
    },
    {
        numero: '04',
        titulo: 'Sábado: retirada com QR',
        texto: 'Retire das 9h às 13h no ponto escolhido mostrando o QR. O produtor recebe depois que você confirma que está tudo certo.',
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
            </svg>
        ),
    },
]

export default function ComoFunciona() {
    return (
        <section id="secao-como-funciona">
            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Ciclo semanal</p>
                <h2>Como funciona</h2>
                <p>Colher só o que já foi vendido: é assim que a colheita não vira perda</p>
            </div>

            <div className="anima-scroll">
                <FaixaCiclo />
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
                <span className="ator-fluxo"><span aria-hidden="true">🏠</span> <span className="cor-amber">Associação (hub)</span></span>
                <span aria-hidden="true">→</span>
                <span className="ator-fluxo"><span aria-hidden="true">🏪</span> <span className="cor-azul">Ponto de retirada</span></span>
                <span aria-hidden="true">→</span>
                <span className="ator-fluxo"><span aria-hidden="true">🧺</span> <span className="cor-branco">Você</span></span>
            </div>

            <div className="centralizar-cta">
                <Link className="cta-pagina" href="/como-funciona">
                    Ver o ciclo completo, selos e pagamento protegido →
                </Link>
            </div>
        </section>
    )
}
