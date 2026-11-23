'use client'

import { useEffect, useState } from 'react'
import './BotaoTopo.css'

// botao flutuante "voltar ao topo", visivel apenas depois de rolar 400px
export default function BotaoTopo() {
    const [visivel, setVisivel] = useState(false)

    useEffect(() => {
        const aoRolar = () => setVisivel(window.scrollY > 400)
        window.addEventListener('scroll', aoRolar, { passive: true })
        return () => window.removeEventListener('scroll', aoRolar)
    }, [])

    return (
        <button
            id="btn-topo"
            type="button"
            className={visivel ? 'visivel' : ''}
            aria-label="Voltar ao topo"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
            ↑
        </button>
    )
}
