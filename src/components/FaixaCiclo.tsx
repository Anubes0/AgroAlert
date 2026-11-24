'use client'

import { useEffect, useState } from 'react'
import { useCiclo } from '@/context/CicloContext'
import { proximaAbertura, proximoFechamento, ROTULO_FASE, tempoAte, type TempoRestante } from '@/lib/ciclo'
import type { FaseCiclo } from '@/types'

// antes "colheita", "retirada" e "encerrado" mostravam a mesma frase
const MENSAGEM_FASE: Record<FaseCiclo, string> = {
    aberto: 'Faça seu pedido até quarta às 20h. O produtor colhe só o que foi vendido e entrega no sábado.',
    colheita: 'Pedidos fechados: os produtores estão colhendo só o que foi vendido. Retirada no sábado, das 9h às 13h.',
    retirada: 'Hoje é dia de retirada: leve o QR do pedido ao seu ponto até as 13h. Novos pedidos a partir de segunda.',
    encerrado: 'Ciclo encerrado: o que não foi retirado virou doação. Novos pedidos a partir de segunda.',
}

function Contagem({ tempo }: { tempo: TempoRestante }) {
    const partes: [number, string][] = [
        [tempo.dias, 'dias'],
        [tempo.horas, 'horas'],
        [tempo.minutos, 'min'],
        [tempo.segundos, 'seg'],
    ]
    return (
        <div className="contagem" aria-label="Tempo restante">
            {partes.map(([valor, rotulo]) => (
                <div key={rotulo}>
                    <b>{String(valor).padStart(2, '0')}</b>
                    <span>{rotulo}</span>
                </div>
            ))}
        </div>
    )
}

// faixa com a fase do ciclo semanal e a contagem regressiva:
// ate o fechamento (qua 20h) quando aberto, ou ate a reabertura (seg)
export default function FaixaCiclo() {
    const { fase, faseManual } = useCiclo()
    const [agora, setAgora] = useState<Date | null>(null)

    // relogio de 1 s so neste componente (nao re-renderiza o site inteiro)
    useEffect(() => {
        setAgora(new Date())
        const timer = setInterval(() => setAgora(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const aberto = fase === 'aberto'
    const alvo = agora ? (aberto ? proximoFechamento(agora) : proximaAbertura(agora)) : null

    return (
        <div className={`faixa-ciclo ${aberto ? '' : 'fase-fechada'}`} role="status">
            <div>
                <strong>{aberto ? '🟢' : '🟡'} {ROTULO_FASE[fase]}</strong>
                <p>
                    {MENSAGEM_FASE[fase]}
                    {faseManual && ' (fase fixada pelo modo demonstração)'}
                </p>
            </div>
            {alvo && agora && !faseManual && <Contagem tempo={tempoAte(alvo, agora)} />}
        </div>
    )
}
