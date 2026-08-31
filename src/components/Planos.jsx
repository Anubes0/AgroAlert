import { useState } from 'react'
import './Planos.css'

const planos = [
    {
        id: 'plano-basico',
        nome: 'Produtor Básico',
        descricao: 'Para começar',
        precoMensal: 'R$39',
        precoAnual: 'R$390',
        destaque: false,
        features: [
            { texto: 'Até 10 alertas/mês', ativo: true },
            { texto: 'Raio fixo 30 km', ativo: true },
            { texto: 'Notif. WhatsApp', ativo: true },
            { texto: 'Painel básico', ativo: true },
            { texto: 'Alertas ilimitados', ativo: false },
            { texto: 'Raio configurável', ativo: false },
            { texto: 'Suporte prioritário', ativo: false },
        ],
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 20h10" />
                <path d="M10 20c5.5-2.5.8-6.4 3-10" />
                <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
                <path d="M14.1 6c1.5-.2 3-.8 4.1-1.9-1.4-.5-3-.7-4.5-.2-1.4.5-2.6 1.6-3 3.3 1.2.7 2.5.9 3.4.7z" />
            </svg>
        ),
        rotuloBotao: 'Começar Agora',
        classeBotao: 'btn-plano-secundario',
        preenchimento: 'Produtor Básico — R$ 39/mês',
    },
    {
        id: 'plano-destaque',
        nome: 'Produtor Pro',
        descricao: 'Máxima performance',
        precoMensal: 'R$89',
        precoAnual: 'R$890',
        destaque: true,
        features: [
            { texto: 'Alertas ilimitados', ativo: true },
            { texto: 'Raio config. 5–100km', ativo: true },
            { texto: 'Painel analítico', ativo: true },
            { texto: 'Histórico completo', ativo: true },
            { texto: 'Suporte prioritário', ativo: true },
            { texto: 'Relatório mensal', ativo: true },
            { texto: 'API (em breve)', ativo: true },
        ],
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
            </svg>
        ),
        rotuloBotao: 'Assinar Pro ◉',
        classeBotao: 'btn-plano-principal',
        preenchimento: 'Produtor Pro — R$ 89/mês',
    },
    {
        id: 'plano-b2b',
        nome: 'Comprador B2B',
        descricao: 'Para restaurantes e mercados',
        precoMensal: 'R$59',
        precoAnual: 'R$590',
        destaque: false,
        features: [
            { texto: 'Alertas tempo real', ativo: true },
            { texto: 'Filtro produto/raio', ativo: true },
            { texto: 'Multi-fornecedores', ativo: true },
            { texto: 'Painel de compras', ativo: true },
            { texto: 'Notif. WhatsApp + e-mail', ativo: true },
            { texto: 'API integração', ativo: false },
            { texto: 'White-label', ativo: false },
        ],
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l1.5-5h15L21 9" />
                <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
                <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
                <path d="M9 20v-6h6v6" />
            </svg>
        ),
        rotuloBotao: 'Começar Agora',
        classeBotao: 'btn-plano-secundario',
        preenchimento: 'Comprador B2B — R$ 59/mês',
    },
]

function Planos({ onSelecionarPlano }) {
    const [anual, setAnual] = useState(false)
    const [planoSelecionado, setPlanoSelecionado] = useState(null)

    function clicarPlano(plano) {
        setPlanoSelecionado(plano.id)
        onSelecionarPlano(plano.preenchimento)
    }

    return (
        <section id="secao-planos">

            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Assinaturas</p>
                <h2>Escolha seu Plano</h2>
                <p>7 dias grátis · sem fidelidade · cancele quando quiser</p>
            </div>

            {/* toggle de cobranca: alterna precos entre mensal e anual */}
            <div id="toggle-cobranca">
                <span className={`rotulo-cobranca${!anual ? ' ativo' : ''}`}>Mensal</span>
                <button
                    id="switch-cobranca"
                    type="button"
                    role="switch"
                    aria-checked={anual}
                    aria-label="Alternar entre cobrança mensal e anual"
                    onClick={() => setAnual((a) => !a)}
                >
                    <span id="bolinha-switch" aria-hidden="true"></span>
                </button>
                <span className={`rotulo-cobranca${anual ? ' ativo' : ''}`}>
                    Anual <span id="selo-economia">2 meses grátis</span>
                </span>
            </div>

            <div id="grade-planos" className="anima-scroll">
                {planos.map((plano) => (
                    <div
                        className={`card-plano${plano.id === planoSelecionado ? ' selecionado' : ''}`}
                        id={plano.id}
                        key={plano.id}
                    >
                        {plano.destaque && <span className="badge-popular">✦ Mais Popular</span>}
                        <span className="icone-plano" aria-hidden="true">{plano.icone}</span>
                        <h3 className="nome-plano">{plano.nome}</h3>
                        <p className="descricao-plano">{plano.descricao}</p>
                        <p className="preco-plano">{anual ? plano.precoAnual : plano.precoMensal}</p>
                        <p className="periodo-plano">{anual ? '/ano' : '/mês'}</p>
                        <hr className="divisor-plano" />
                        <ul className="lista-features">
                            {plano.features.map((f) => (
                                <li className={f.ativo ? 'ativo' : 'inativo'} key={f.texto}>{f.texto}</li>
                            ))}
                        </ul>
                        <button
                            className={plano.classeBotao}
                            type="button"
                            onClick={() => clicarPlano(plano)}
                        >
                            {plano.rotuloBotao}
                        </button>
                    </div>
                ))}
            </div>

            <p id="rodape-planos">7 dias grátis · sem fidelidade · cancele quando quiser</p>

        </section>
    )
}

export default Planos
