import type { Categoria, FaseCiclo } from '@/types'

// Ciclo semanal (Parte 2 do modelo):
//   segunda 00h -> quarta 20h : pedidos abertos
//   quarta 20h  -> sabado 9h  : fechamento + colheita sob encomenda
//   sabado 9h   -> sabado 13h : retirada nos pontos
//   sabado 13h  -> domingo    : encerrado (sobras viram doacao)

const QUARTA = 3
const SABADO = 6

export function faseDoRelogio(agora: Date): FaseCiclo {
    const dia = agora.getDay() // 0 = domingo
    const hora = agora.getHours() + agora.getMinutes() / 60

    if (dia >= 1 && dia < QUARTA) return 'aberto'
    if (dia === QUARTA) return hora < 20 ? 'aberto' : 'colheita'
    if (dia > QUARTA && dia < SABADO) return 'colheita'
    if (dia === SABADO) {
        if (hora < 9) return 'colheita'
        if (hora < 13) return 'retirada'
    }
    return 'encerrado'
}

// proximo instante "quarta-feira 20h" a partir de agora
export function proximoFechamento(agora: Date): Date {
    const alvo = new Date(agora)
    alvo.setHours(20, 0, 0, 0)
    const diasAteQuarta = (QUARTA - agora.getDay() + 7) % 7
    alvo.setDate(agora.getDate() + diasAteQuarta)
    if (alvo <= agora) alvo.setDate(alvo.getDate() + 7)
    return alvo
}

// proxima segunda 00h (reabertura dos pedidos)
export function proximaAbertura(agora: Date): Date {
    const alvo = new Date(agora)
    alvo.setHours(0, 0, 0, 0)
    const diasAteSegunda = (1 - agora.getDay() + 7) % 7 || 7
    alvo.setDate(agora.getDate() + diasAteSegunda)
    return alvo
}

export interface TempoRestante {
    dias: number
    horas: number
    minutos: number
    segundos: number
}

export function tempoAte(alvo: Date, agora: Date): TempoRestante {
    const totalSeg = Math.max(0, Math.floor((alvo.getTime() - agora.getTime()) / 1000))
    return {
        dias: Math.floor(totalSeg / 86400),
        horas: Math.floor((totalSeg % 86400) / 3600),
        minutos: Math.floor((totalSeg % 3600) / 60),
        segundos: totalSeg % 60,
    }
}

export const ROTULO_FASE: Record<FaseCiclo, string> = {
    aberto: 'Pedidos abertos',
    colheita: 'Ciclo fechado · colheita sob encomenda',
    retirada: 'Retirada nos pontos (sáb. 9h–13h)',
    encerrado: 'Ciclo encerrado · reabre na segunda',
}

// prazo para reclamar depois da retirada (Parte 2): itens de alta
// perecibilidade murcham rapido, entao o prazo e menor
export function prazoReclamacaoHoras(categoria: Categoria): number {
    return categoria === 'folhosas' || categoria === 'ervas' ? 24 : 48
}
