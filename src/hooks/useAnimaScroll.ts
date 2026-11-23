'use client'

import { useEffect } from 'react'

// observa os elementos ".anima-scroll" e adiciona a classe "visivel" quando
// entram na tela (efeito de revelar ao rolar, herdado da Fase 4).
// Na Fase 7 as paginas carregam dados depois do primeiro render (fetch),
// entao um MutationObserver tambem pega os elementos que aparecem depois.
export default function useAnimaScroll(gatilho?: unknown) {
    useEffect(() => {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.anima-scroll').forEach((el) => el.classList.add('visivel'))
            return
        }

        const observador = new IntersectionObserver(
            (entradas) => {
                entradas.forEach((entrada) => {
                    if (entrada.isIntersecting) {
                        entrada.target.classList.add('visivel')
                        observador.unobserve(entrada.target)
                    }
                })
            },
            { threshold: 0.12 }
        )

        const observarPendentes = () =>
            document.querySelectorAll('.anima-scroll:not(.visivel)').forEach((el) => observador.observe(el))

        observarPendentes()
        const vigia = new MutationObserver(observarPendentes)
        vigia.observe(document.body, { childList: true, subtree: true })

        return () => {
            vigia.disconnect()
            observador.disconnect()
        }
    }, [gatilho])
}
