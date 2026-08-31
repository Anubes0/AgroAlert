import { useEffect, useState } from 'react'
import './Navbar.css'

// links do menu: cada um aponta pro id da secao dentro da Home
const linksMenu = [
    { id: 'secao-hero', rotulo: 'Início' },
    { id: 'secao-como-funciona', rotulo: 'Como Funciona' },
    { id: 'secao-planos', rotulo: 'Planos' },
    { id: 'secao-impacto', rotulo: 'Impacto' },
    { id: 'secao-faq', rotulo: 'FAQ' },
    { id: 'secao-contato', rotulo: 'Fale Conosco' },
]

// navbar fixa no topo, presente em todas as "paginas" da SPA
function Navbar({ paginaAtual, navegarPara }) {
    const [menuAberto, setMenuAberto] = useState(false)
    const [secaoAtiva, setSecaoAtiva] = useState('secao-hero')

    function fecharMenu() {
        setMenuAberto(false)
    }

    function clicarLink(id) {
        navegarPara('home', id)
        fecharMenu()
    }

    // scrollspy: so faz sentido observar as secoes quando estamos na Home
    useEffect(() => {
        if (paginaAtual !== 'home') return
        if (!('IntersectionObserver' in window)) return

        const secoes = document.querySelectorAll('main section[id]')
        if (!secoes.length) return

        const observador = new IntersectionObserver(
            (entradas) => {
                entradas.forEach((entrada) => {
                    if (entrada.isIntersecting) {
                        setSecaoAtiva(entrada.target.getAttribute('id'))
                    }
                })
            },
            { rootMargin: '-45% 0px -50% 0px' }
        )

        secoes.forEach((secao) => observador.observe(secao))
        return () => observador.disconnect()
    }, [paginaAtual])

    return (
        <header id="cabecalho-site">
            <nav id="navbar">

                <div id="logo-container">
                    <button type="button" className="logo-botao" onClick={() => navegarPara('home')}>
                        <div id="logo-icone"><span>A</span></div>
                        <span id="logo-texto">AgroAlert</span>
                    </button>
                </div>

                <ul id="menu-links" className={menuAberto ? 'aberto' : ''}>
                    {linksMenu.map((link) => (
                        <li key={link.id}>
                            <a
                                href={`#${link.id}`}
                                className={paginaAtual === 'home' && secaoAtiva === link.id ? 'ativo' : ''}
                                onClick={(e) => {
                                    e.preventDefault()
                                    clicarLink(link.id)
                                }}
                            >
                                {link.rotulo}
                            </a>
                        </li>
                    ))}
                </ul>

                <div id="acoes-navbar">
                    <button id="btn-navbar" type="button" onClick={() => navegarPara('home', 'secao-planos')}>
                        Ver Planos →
                    </button>
                    <button
                        id="btn-hamburguer"
                        type="button"
                        className={menuAberto ? 'aberto' : ''}
                        aria-label="Abrir menu de navegação"
                        aria-expanded={menuAberto}
                        aria-controls="menu-links"
                        onClick={() => setMenuAberto((aberto) => !aberto)}
                    >
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </button>
                </div>

            </nav>
        </header>
    )
}

export default Navbar
