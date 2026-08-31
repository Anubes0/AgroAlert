import './Footer.css'

// rodape do site, presente em todas as "paginas" da SPA
function Footer({ navegarPara }) {
    return (
        <footer id="rodape-site">
            <p>© 2026 AgroAlert · Plataforma Digital Agrícola · PBL Fase 5</p>
            <nav className="links-rodape" aria-label="Links do rodapé">
                <a href="#funcionamento" onClick={(e) => { e.preventDefault(); navegarPara('funcionamento') }}>Funcionamento</a>
                <a href="#privacidade" onClick={(e) => { e.preventDefault(); navegarPara('privacidade') }}>Privacidade</a>
                <a href="#termos" onClick={(e) => { e.preventDefault(); navegarPara('privacidade', 'termos') }}>Termos</a>
                <a href="#lgpd" onClick={(e) => { e.preventDefault(); navegarPara('privacidade', 'lgpd') }}>LGPD</a>
            </nav>
        </footer>
    )
}

export default Footer
