'use client'

import { useState } from 'react'
import { useCiclo } from '@/context/CicloContext'
import { limparTudoPersistido } from '@/hooks/usePersistente'
import { ROTULO_FASE } from '@/lib/ciclo'
import type { FaseCiclo } from '@/types'

const FASES: FaseCiclo[] = ['aberto', 'colheita', 'retirada', 'encerrado']

// controle discreto para a gravacao do Pitch Video: fixa a fase do ciclo
// (que normalmente segue o relogio) e restaura os dados de demonstracao
export default function ModoDemonstracao() {
    const [aberto, setAberto] = useState(false)
    const { fase, faseManual, definirFaseManual } = useCiclo()

    function restaurar() {
        if (!window.confirm('Apagar cesta, pedidos, ofertas editadas e sessão salvos neste navegador?')) return
        limparTudoPersistido()
        window.location.href = '/'
    }

    return (
        <div className="modo-demo">
            <button type="button" className="botao-demo" aria-expanded={aberto} onClick={() => setAberto((a) => !a)}>
                ⚙ Modo demonstração {faseManual ? '· ativo' : ''}
            </button>

            {aberto && (
                <div className="painel-demo">
                    <label>
                        Fase do ciclo
                        <select
                            value={faseManual ?? 'auto'}
                            onChange={(e) => definirFaseManual(e.target.value === 'auto' ? null : (e.target.value as FaseCiclo))}
                        >
                            <option value="auto">Automática (relógio) — agora: {ROTULO_FASE[fase]}</option>
                            {FASES.map((f) => (
                                <option key={f} value={f}>{ROTULO_FASE[f]}</option>
                            ))}
                        </select>
                    </label>
                    <button type="button" className="botao-demo" onClick={restaurar}>
                        Restaurar dados de demonstração
                    </button>
                </div>
            )}
        </div>
    )
}
