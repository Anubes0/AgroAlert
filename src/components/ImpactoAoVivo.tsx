'use client'

import { useLoja } from '@/context/LojaContext'
import { calcularRepasse, moeda } from '@/lib/taxas'
import { valorEntregueItem } from '@/lib/pedidos'

// indicadores de impacto calculados a partir dos pedidos salvos (Context)
export default function ImpactoAoVivo() {
    const { pedidos, ofertas } = useLoja()

    const itens = pedidos.flatMap((p) => p.itens)
    const valorEntregue = itens.reduce((soma, i) => soma + valorEntregueItem(i), 0)
    const kgColhidosSobEncomenda = itens
        .filter((i) => i.unidade === 'kg')
        .reduce((soma, i) => soma + i.quantidade - i.faltante, 0)
    const doados = pedidos.filter((p) => p.status === 'nao-retirado').length
    const produtoresAtivos = new Set(ofertas.map((o) => o.produtorId)).size

    const numeros = [
        { valor: moeda(calcularRepasse(valorEntregue).produtor), rotulo: 'para os produtores neste ciclo (85% das vendas)' },
        { valor: `${kgColhidosSobEncomenda.toLocaleString('pt-BR')} kg`, rotulo: 'colhidos sob encomenda — zero sobra no campo' },
        { valor: `${pedidos.length}`, rotulo: `pedidos de ${produtoresAtivos} produtores · ${doados} doados por não retirada` },
    ]

    return (
        <div id="grade-numeros" className="anima-scroll">
            {numeros.map((n) => (
                <div key={n.rotulo}>
                    <p className="numero-impacto">{n.valor}</p>
                    <p className="label-impacto">{n.rotulo}</p>
                </div>
            ))}
        </div>
    )
}
