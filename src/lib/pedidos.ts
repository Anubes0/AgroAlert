import type { FaseCiclo, ItemPedido, Pedido, StatusExibido } from '@/types'
import { TAXAS } from './taxas'
import { prazoReclamacaoHoras } from './ciclo'

const HORA_MS = 60 * 60 * 1000

export interface ValoresPedido {
    subtotal: number // produtos pedidos
    desconto: number // assinatura
    estorno: number // itens que faltaram na colheita (ja com desconto aplicado)
    taxaRetirada: number
    total: number // o que ficou efetivamente cobrado
}

export function valorItem(item: ItemPedido): number {
    return item.precoUnit * item.quantidade
}

export function valorEntregueItem(item: ItemPedido): number {
    return item.precoUnit * (item.quantidade - item.faltante)
}

export function calcularValores(pedido: Pedido): ValoresPedido {
    const fatorDesconto = pedido.assinatura ? TAXAS.descontoAssinatura : 0
    const subtotal = pedido.itens.reduce((soma, item) => soma + valorItem(item), 0)
    const desconto = subtotal * fatorDesconto
    const faltante = pedido.itens.reduce((soma, item) => soma + item.precoUnit * item.faltante, 0)
    const estorno = faltante * (1 - fatorDesconto)
    return {
        subtotal,
        desconto,
        estorno,
        taxaRetirada: pedido.taxaRetirada,
        total: subtotal - desconto - estorno + pedido.taxaRetirada,
    }
}

// momento em que a confirmacao vira automatica: usa o MAIOR prazo entre os
// itens (24h folhosas/ervas, 48h demais) — reclamacao por item respeita o seu
export function prazoFinalReclamacao(pedido: Pedido): Date | null {
    if (!pedido.retiradoEm) return null
    const maiorPrazo = Math.max(...pedido.itens.map((i) => prazoReclamacaoHoras(i.categoria)))
    return new Date(new Date(pedido.retiradoEm).getTime() + maiorPrazo * HORA_MS)
}

export function itemDentroDoPrazo(pedido: Pedido, item: ItemPedido, agora: Date): boolean {
    if (!pedido.retiradoEm) return false
    const limite = new Date(pedido.retiradoEm).getTime() + prazoReclamacaoHoras(item.categoria) * HORA_MS
    return agora.getTime() <= limite
}

// status mostrado na tela: parte e salvo, parte e derivado do relogio/ciclo
//  - "pago" depois do fechamento do ciclo aparece como "em colheita"
//  - "retirado" sem reclamacao apos o prazo vira "confirmado" automaticamente
export function statusExibido(pedido: Pedido, fase: FaseCiclo, agora: Date): StatusExibido {
    if (pedido.status === 'pago' && fase !== 'aberto') return 'em-colheita'
    if (pedido.status === 'retirado') {
        const prazo = prazoFinalReclamacao(pedido)
        if (prazo && agora > prazo) return 'confirmado'
    }
    return pedido.status
}

// o repasse ao produtor so e liberado quando a entrega foi cumprida
export function repasseLiberado(status: StatusExibido): boolean {
    return status === 'confirmado' || status === 'nao-retirado'
}

// codigo curto e legivel para o QR code: AG-1234
export function gerarCodigo(existentes: string[]): string {
    let codigo = ''
    do {
        codigo = `AG-${Math.floor(1000 + Math.random() * 9000)}`
    } while (existentes.includes(codigo))
    return codigo
}

export function gerarId(prefixo: string): string {
    return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function formatarQuantidade(valor: number, unidade: string): string {
    const numero = Number.isInteger(valor) ? valor.toString() : valor.toFixed(1).replace('.', ',')
    return `${numero} ${unidade}`
}
