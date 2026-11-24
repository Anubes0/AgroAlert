import Link from 'next/link'
import ModoDemonstracao from './ModoDemonstracao'
import './Footer.css'

// rodape presente em todas as rotas (fica no layout raiz)
export default function Footer() {
    return (
        <footer id="rodape-site">
            <div>
                <p>© 2026 AgroAlert · Protótipo acadêmico (PBL FIAP · Fase 7) · produtores, pontos e pedidos fictícios</p>
                <ModoDemonstracao />
            </div>
            <nav className="links-rodape" aria-label="Links do rodapé">
                <Link href="/ofertas">Ofertas</Link>
                <Link href="/como-funciona">Como funciona</Link>
                <Link href="/produtores">Para produtores</Link>
                <Link href="/mapa">Pontos de retirada</Link>
                <Link href="/privacidade">Privacidade</Link>
                <Link href="/privacidade#termos">Termos</Link>
                <Link href="/privacidade#lgpd">LGPD</Link>
            </nav>
        </footer>
    )
}
