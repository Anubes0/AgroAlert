'use client'

import { formatarQuantidade } from '@/lib/pedidos'
import type { Unidade } from '@/types'

// kg anda de 0,5 em 0,5; unidades, macos e bandejas de 1 em 1
export function passoDa(unidade: Unidade): number {
    return unidade === 'kg' ? 0.5 : 1
}

interface Props {
    valor: number
    unidade: Unidade
    maximo: number
    aoMudar: (valor: number) => void
    minimo?: number
}

export default function SeletorQuantidade({ valor, unidade, maximo, aoMudar, minimo = 0 }: Props) {
    const passo = passoDa(unidade)
    return (
        <div className="seletor-qtd">
            <button type="button" aria-label="Diminuir" disabled={valor - passo < minimo} onClick={() => aoMudar(valor - passo)}>
                −
            </button>
            <span>{formatarQuantidade(valor, unidade)}</span>
            <button type="button" aria-label="Aumentar" disabled={valor + passo > maximo} onClick={() => aoMudar(valor + passo)}>
                +
            </button>
        </div>
    )
}
