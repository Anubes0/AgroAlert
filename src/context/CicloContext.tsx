'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import usePersistente from '@/hooks/usePersistente'
import { faseDoRelogio } from '@/lib/ciclo'
import type { FaseCiclo } from '@/types'

// Fase do ciclo semanal. Por padrao segue o relogio real; o "modo
// demonstracao" (rodape) permite fixar uma fase para gravar o PV em qualquer dia.

interface CicloValor {
    fase: FaseCiclo
    faseManual: FaseCiclo | null
    definirFaseManual: (fase: FaseCiclo | null) => void
}

const CicloContext = createContext<CicloValor | null>(null)

export function CicloProvider({ children }: { children: ReactNode }) {
    const [faseManual, setFaseManual] = usePersistente<FaseCiclo | null>('fase-demo', null)
    const [faseReal, setFaseReal] = useState<FaseCiclo>('aberto')

    // reavalia a fase real a cada 30 s (troca de fase acontece em horas cheias)
    useEffect(() => {
        const atualizar = () => setFaseReal(faseDoRelogio(new Date()))
        atualizar()
        const timer = setInterval(atualizar, 30_000)
        return () => clearInterval(timer)
    }, [])

    return (
        <CicloContext.Provider
            value={{
                fase: faseManual ?? faseReal,
                faseManual,
                definirFaseManual: setFaseManual,
            }}
        >
            {children}
        </CicloContext.Provider>
    )
}

export function useCiclo(): CicloValor {
    const valor = useContext(CicloContext)
    if (!valor) throw new Error('useCiclo precisa estar dentro de <CicloProvider>')
    return valor
}
