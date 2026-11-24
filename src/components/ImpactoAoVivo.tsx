'use client'

import { useLoja } from '@/context/LojaContext'
import { calcularRepasse, META_PILOTO, moeda } from '@/lib/taxas'
import { valorEntregueItem } from '@/lib/pedidos'

// meta do piloto (ponto de equilibrio do modelo de negocio) + andamento do
// ciclo atual, calculado a partir dos pedidos salvos no Context
export default function ImpactoAoVivo() {
    const { pedidos, ofertas, pronto } = useLoja()

    const itens = pedidos.flatMap((p) => p.itens)
    const valorEntregue = itens.reduce((soma, i) => soma + valorEntregueItem(i), 0)
    const kgSobEncomenda = itens
        .filter((i) => i.unidade === 'kg')
        .reduce((soma, i) => soma + i.quantidade - i.faltante, 0)
    const produtoresAtivos = new Set(ofertas.map((o) => o.produtorId)).size

    const meta = META_PILOTO.pedidosEquilibrioSemana
    const progresso = Math.min(100, Math.round((pedidos.length / meta) * 100))

    const numeros = [
        { valor: moeda(calcularRepasse(valorEntregue).produtor), rotulo: 'para os produtores neste ciclo (85% das vendas)' },
        { valor: `${kgSobEncomenda.toLocaleString('pt-BR')} kg`, rotulo: 'colhidos sob encomenda — zero sobra no campo' },
        { valor: `${produtoresAtivos || META_PILOTO.produtores}`, rotulo: 'famílias produtoras ofertando nesta semana' },
    ]

    return (
        <>
            <div className="meta-piloto anima-scroll">
                <div className="meta-topo">
                    <div>
                        <span className="meta-rotulo">Meta do piloto</span>
                        <strong>{meta} pedidos por semana</strong>
                    </div>
                    <span className="meta-contagem">
                        {pronto ? pedidos.length : '–'} <small>de {meta}</small>
                    </span>
                </div>
                <div
                    className="barra-meta"
                    role="progressbar"
                    aria-label="Pedidos deste ciclo em relação à meta do piloto"
                    aria-valuemin={0}
                    aria-valuemax={meta}
                    aria-valuenow={pedidos.length}
                >
                    <span style={{ width: `${progresso}%` }} />
                </div>
            </div>

            <div id="grade-numeros" className="anima-scroll">
                {numeros.map((n) => (
                    <div key={n.rotulo}>
                        <p className="numero-impacto">{n.valor}</p>
                        <p className="label-impacto">{n.rotulo}</p>
                    </div>
                ))}
            </div>
        </>
    )
}
