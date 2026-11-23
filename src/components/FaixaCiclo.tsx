'use client'

import { useEffect, useState } from 'react'
import { useCiclo } from '@/context/CicloContext'
import { proximaAbertura, proximoFechamento, ROTULO_FASE, tempoAte, type TempoRestante } from '@/lib/ciclo'

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
                    {aberto
                        ? 'Faça seu pedido até quarta às 20h. O produtor colhe só o que foi vendido e entrega no sábado.'
                        : 'Os produtores estão colhendo e entregando os pedidos desta semana. Novos pedidos a partir de segunda.'}
                    {faseManual && ' (fase fixada pelo modo demonstração)'}
                </p>
            </div>
            {alvo && agora && !faseManual && <Contagem tempo={tempoAte(alvo, agora)} />}
        </div>
    )
}
