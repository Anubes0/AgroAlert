'use client'

import { useEffect, useState } from 'react'

// "agora" que se atualiza sozinho (prazos de reclamacao, confirmacao automatica)
export default function useAgora(intervaloMs = 30_000): Date {
    const [agora, setAgora] = useState(() => new Date())
    useEffect(() => {
        const timer = setInterval(() => setAgora(new Date()), intervaloMs)
        return () => clearInterval(timer)
    }, [intervaloMs])
    return agora
}
