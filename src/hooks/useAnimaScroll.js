import { useEffect } from 'react'

// observa todos os elementos ".anima-scroll" da pagina atual e adiciona
// a classe "visivel" quando entram na tela (efeito de revelar ao rolar).
// "gatilho" e um valor que muda quando a pagina troca, pra reobservar.
function useAnimaScroll(gatilho) {
    useEffect(() => {
        const elementos = document.querySelectorAll('.anima-scroll')
        if (!elementos.length) return

        if (!('IntersectionObserver' in window)) {
            elementos.forEach((el) => el.classList.add('visivel'))
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

        elementos.forEach((el) => observador.observe(el))
        return () => observador.disconnect()
    }, [gatilho])
}

export default useAnimaScroll
