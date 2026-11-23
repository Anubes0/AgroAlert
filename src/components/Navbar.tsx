'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLoja } from '@/context/LojaContext'
import type { Perfil } from '@/types'
import './Navbar.css'

// Fase 7: a navegacao por estado (navegarPara) da Fase 5/6 deu lugar ao
// roteamento do Next (App Router). <Link> troca de rota sem recarregar a
// pagina e usePathname() diz qual link esta ativo.
const linksMenu = [
    { href: '/', rotulo: 'Início' },
    { href: '/ofertas', rotulo: 'Ofertas da semana' },
    { href: '/mapa', rotulo: 'Mapa' },
    { href: '/como-funciona', rotulo: 'Como funciona' },
]

const areaDoPerfil: Record<Perfil, { href: string; rotulo: string }> = {
    consumidor: { href: '/pedidos', rotulo: 'Meus pedidos' },
    produtor: { href: '/painel', rotulo: 'Meu painel' },
    ponto: { href: '/ponto', rotulo: 'Painel do ponto' },
}

export default function Navbar() {
    const [menuAberto, setMenuAberto] = useState(false)
    const caminho = usePathname()
    const router = useRouter()
    const { usuario, sair } = useAuth()
    const { cesta } = useLoja()

    const itensNaCesta = cesta.length
    const area = usuario ? areaDoPerfil[usuario.perfil] : null
    const links = area ? [...linksMenu, area] : linksMenu

    const estaAtivo = (href: string) => (href === '/' ? caminho === '/' : caminho.startsWith(href))

    function aoSair() {
        sair()
        setMenuAberto(false)
        router.push('/')
    }

    return (
        <header id="cabecalho-site">
            <nav id="navbar" aria-label="Navegação principal">
                <div id="logo-container">
                    <Link href="/" className="logo-botao" onClick={() => setMenuAberto(false)}>
                        <div id="logo-icone"><span>A</span></div>
                        <span id="logo-texto">AgroAlert</span>
                    </Link>
                </div>

                <ul id="menu-links" className={menuAberto ? 'aberto' : ''}>
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={estaAtivo(link.href) ? 'ativo' : ''}
                                aria-current={estaAtivo(link.href) ? 'page' : undefined}
                                onClick={() => setMenuAberto(false)}
                            >
                                {link.rotulo}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div id="acoes-navbar">
                    {usuario?.perfil !== 'produtor' && usuario?.perfil !== 'ponto' && (
                        <Link href="/cesta" id="btn-cesta" aria-label={`Cesta com ${itensNaCesta} itens`}>
                            🧺 <span className="rotulo-cesta">Cesta</span>
                            {itensNaCesta > 0 && <span className="contador-cesta">{itensNaCesta}</span>}
                        </Link>
                    )}

                    {usuario ? (
                        <div className="usuario-navbar">
                            <span className="nome-usuario" title={usuario.nome}>{usuario.nome.split(' ')[0]}</span>
                            <button type="button" id="btn-navbar" onClick={aoSair}>Sair</button>
                        </div>
                    ) : (
                        <Link href="/entrar" id="btn-navbar">Entrar →</Link>
                    )}

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
