import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { TAXAS } from '@/lib/taxas'
import '@/styles/PaginaInterna.css'
import '@/styles/Funcionamento.css'

export const metadata: Metadata = { title: 'Como funciona' }

interface Etapa {
    papel: string
    titulo: string
    texto: string
    destaque?: string
    itens?: ReactNode[]
}

// o ciclo semanal completo (Parte 2 do modelo de negocio)
const etapas: Etapa[] = [
    {
        papel: 'Segunda · Produtor',
        titulo: 'Publicação da oferta da semana',
        texto: 'Pelo painel (ou com ajuda da associação, no cadastro assistido), o produtor publica o que espera colher:',
        itens: [
            'produto, quantidade máxima e preço por unidade;',
            <>classe de qualidade: <strong>padrão</strong> ou <strong>&quot;feio mas bom&quot;</strong> (fora do padrão, com desconto);</>,
            'se é colheita da semana ou antecipada (ex.: por alerta de geada).',
        ],
    },
    {
        papel: 'Segunda a quarta 20h · Consumidor',
        titulo: 'Encomenda e pagamento retido',
        texto: 'O consumidor monta a cesta, escolhe o ponto de retirada e paga via Pix. O valor fica guardado por um intermediador de pagamento — e não na conta do AgroAlert — até a retirada.',
        destaque: `Exemplo: R$ 80 em produtos + R$ ${TAXAS.taxaRetirada} de taxa de retirada (R$ ${TAXAS.parteFrete} para a rota e R$ ${TAXAS.partePonto} para o ponto).`,
        itens: [`Assinatura semanal da mesma cesta: ${Math.round(TAXAS.descontoAssinatura * 100)}% de desconto.`, 'A regra de não retirada (vira doação) é aceita antes do pagamento.'],
    },
    {
        papel: 'Quarta 20h · Sistema',
        titulo: 'Fechamento do ciclo e romaneio',
        texto: 'Os pedidos fecham e cada produtor recebe o romaneio: quanto colher de cada item e para qual pedido. Se um ponto tiver menos de 10 pedidos na semana, eles vão para o ponto mais próximo — e o consumidor é avisado.',
    },
    {
        papel: 'Quinta e sexta · Produtor',
        titulo: 'Colheita sob encomenda',
        texto: 'O produtor colhe só o que foi vendido, classifica e embala cada pedido com etiqueta e QR code. Se faltar produto, ele registra a falta e o item é estornado automaticamente ao consumidor.',
    },
    {
        papel: 'Sábado cedo · Associação',
        titulo: 'Rota compartilhada',
        texto: 'Um único veículo recolhe as caixas de todos os produtores na sede da associação (o hub) e distribui nos pontos de retirada. O frete é dividido entre todos os pedidos.',
    },
    {
        papel: 'Sábado 9h–13h · Ponto de retirada',
        titulo: 'QR duplo: recebimento e retirada',
        texto: 'O ponto escaneia o QR duas vezes:',
        itens: [
            <><strong>QR 1 — recebimento:</strong> a caixa chegou ao ponto. É a prova de que o produtor cumpriu a entrega.</>,
            <><strong>QR 2 — retirada:</strong> o consumidor levou o pedido. Começa o prazo de reclamação.</>,
        ],
    },
    {
        papel: 'Depois da retirada · Pagamento',
        titulo: 'Confirmação e repasse',
        texto: 'O repasse ao produtor (85% dos produtos) é liberado quando o consumidor confirma — ou automaticamente, sem reclamação, depois de:',
        itens: [
            <><strong>24h</strong> para itens de alta perecibilidade (folhosas, ervas);</>,
            <><strong>48h</strong> para frutas, legumes e raízes.</>,
            'Pedido não retirado até 13h: o alimento é doado e o produtor recebe normalmente.',
        ],
    },
]

export default function ComoFuncionaPagina() {
    return (
        <>
            <section className="hero-pagina">
                <Link className="trilha-volta" href="/">← Voltar para a Home</Link>
                <p className="badge-secao">Ciclo semanal sob encomenda</p>
                <h1>Como o AgroAlert funciona por dentro</h1>
                <p>
                    Da oferta publicada na segunda à retirada no sábado: como a colheita sob encomenda, a rota compartilhada e o
                    pagamento protegido fazem a conta fechar para o produtor e para quem compra.
                </p>
            </section>

            <section className="conteudo-pagina">
                <div className="timeline anima-scroll">
                    {etapas.map((etapa, indice) => (
                        <div className="etapa" key={etapa.titulo}>
                            <span className="marcador" aria-hidden="true">{indice + 1}</span>
                            <span className="papel">{etapa.papel}</span>
                            <h3>{etapa.titulo}</h3>
                            <p>{etapa.texto}</p>
                            {etapa.destaque && <p className="destaque-etapa">{etapa.destaque}</p>}
                            {etapa.itens && (
                                <ul>
                                    {etapa.itens.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>

                <div className="bloco-geo anima-scroll">
                    <h3>Em foco: alerta de clima para a colheita</h3>
                    <p>
                        O painel do produtor consulta a previsão do tempo da propriedade. Geada, ventania ou chuva forte
                        viram uma recomendação prática no ciclo: <strong>antecipar a colheita</strong> e ofertar antes da perda,
                        ou <strong>reduzir a quantidade prometida</strong> para não gerar estornos.
                    </p>
                    <p>
                        E por que a associação no meio? Ela é o hub rural: confere a qualidade, emite a nota fiscal, faz a ponte
                        com a organização que confere os selos (OCS) e monta os lotes &quot;fora de padrão&quot; para a indústria e as doações.
                    </p>
                </div>

                <div className="centralizar-cta" style={{ marginTop: '48px' }}>
                    <Link className="cta-pagina" href="/ofertas">Ver as ofertas desta semana →</Link>
                </div>
            </section>
        </>
    )
}
