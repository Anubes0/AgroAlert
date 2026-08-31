import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BotaoTopo from './components/BotaoTopo'
import Home from './pages/Home'
import Funcionamento from './pages/Funcionamento'
import Privacidade from './pages/Privacidade'

// SPA com estado: nao usamos react-router (o capitulo da Fase 5 nao
// ensina roteamento), entao quem controla qual "pagina" aparece e esse
// estado aqui em cima, junto com o alvo de rolagem pendente.
function App() {
    const [pagina, setPagina] = useState('home')
    const [ancoraPendente, setAncoraPendente] = useState(null)

    // navega para uma "pagina" (home/funcionamento/privacidade) e,
    // opcionalmente, rola ate um id especifico depois de trocar de pagina.
    // se ja estivermos na pagina certa, so rola (sem trocar de tela).
    function navegarPara(destino, ancoraId) {
        if (destino === pagina) {
            rolarPara(ancoraId)
            return
        }
        setPagina(destino)
        setAncoraPendente(ancoraId ?? null)
    }

    function rolarPara(id) {
        if (!id) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }
        const elemento = document.getElementById(id)
        if (elemento) elemento.scrollIntoView({ behavior: 'smooth' })
    }

    // depois que a pagina troca e o novo conteudo ja esta no DOM,
    // resolve a rolagem pendente (com um pequeno delay pra garantir o layout pronto)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (ancoraPendente) {
                rolarPara(ancoraPendente)
            } else {
                window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
            }
            setAncoraPendente(null)
        }, 50)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagina])

    return (
        <>
            <Navbar paginaAtual={pagina} navegarPara={navegarPara} />

            <main>
                {pagina === 'home' && <Home navegarPara={navegarPara} />}
                {pagina === 'funcionamento' && <Funcionamento navegarPara={navegarPara} />}
                {pagina === 'privacidade' && <Privacidade navegarPara={navegarPara} />}
            </main>

            <Footer navegarPara={navegarPara} />
            <BotaoTopo />
        </>
    )
}

export default App
