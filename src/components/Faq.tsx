'use client'

import { useState } from 'react'
import './Faq.css'

const perguntas = [
    {
        pergunta: 'Por que só dá para encomendar até quarta?',
        resposta: 'Porque o produtor colhe só o que já foi vendido. Na quarta às 20h o ciclo fecha, cada produtor recebe o romaneio (o que colher e para quem) e colhe na quinta e sexta. É assim que a colheita não vira perda.',
    },
    {
        pergunta: 'Quando o produtor recebe o meu pagamento?',
        resposta: 'Seu Pix fica retido em custódia. O valor só é liberado ao produtor depois que você retira o pedido e confirma — ou automaticamente após 24h (folhosas e ervas) ou 48h (demais itens) sem reclamação.',
    },
    {
        pergunta: 'E se faltar algum item na colheita?',
        resposta: 'O item que faltou nunca é repassado ao produtor: ele é estornado automaticamente para você. A taxa de cumprimento de cada produtor fica visível no perfil.',
    },
    {
        pergunta: 'O que acontece se eu não retirar no sábado?',
        resposta: 'O produtor cumpriu a entrega no ponto e recebe normalmente; o alimento é doado e não há reembolso. A regra aparece antes de você pagar.',
    },
    {
        pergunta: 'O que significa cada selo?',
        resposta: '"Orgânico certificado" e "Orgânico — venda direta (OCS)" são conferidos no cadastro do Ministério da Agricultura (Lei 10.831/2003). "Em transição agroecológica" é produção natural sem registro, conferida pela associação — e não usa a palavra "orgânico".',
    },
    {
        pergunta: 'Sou produtor. Quanto custa?',
        resposta: 'Nada para entrar. Você paga 15% apenas sobre o que vender (12% AgroAlert + 3% para a associação que cuida do hub, da nota fiscal e da rota).',
    },
]

export default function Faq() {
    // indice do item aberto (um por vez, como o acordeao original)
    const [abertoIndex, setAbertoIndex] = useState<number | null>(null)

    return (
        <section id="secao-faq">
            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Dúvidas</p>
                <h2>Perguntas frequentes</h2>
                <p>O que consumidores e produtores mais perguntam antes de começar</p>
            </div>

            <div id="lista-faq" className="anima-scroll">
                {perguntas.map((item, indice) => {
                    const aberto = abertoIndex === indice
                    return (
                        <div className="item-faq" key={item.pergunta}>
                            <button
                                className="pergunta-faq"
                                type="button"
                                aria-expanded={aberto}
                                onClick={() => setAbertoIndex((atual) => (atual === indice ? null : indice))}
                            >
                                <span>{item.pergunta}</span>
                                <span className="seta-faq" aria-hidden="true">+</span>
                            </button>
                            <div className={`resposta-faq${aberto ? ' aberta' : ''}`}>
                                <div className="resposta-faq-interior">
                                    <p>{item.resposta}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
