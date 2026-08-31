import { useEffect, useState } from 'react'
import './BotaoTopo.css'

// botao flutuante "voltar ao topo", visivel apenas depois de rolar 400px
function BotaoTopo() {
    const [visivel, setVisivel] = useState(false)

    useEffect(() => {
        function aoRolar() {
            setVisivel(window.scrollY > 400)
        }
        window.addEventListener('scroll', aoRolar)
        return () => window.removeEventListener('scroll', aoRolar)
    }, [])

    function voltarAoTopo() {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <button
            id="btn-topo"
            type="button"
            className={visivel ? 'visivel' : ''}
            aria-label="Voltar ao topo"
            onClick={voltarAoTopo}
        >
            ↑
        </button>
    )
}

export default BotaoTopo
