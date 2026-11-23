import Link from 'next/link'

// convencao do App Router: renderizada para qualquer rota inexistente
// e quando uma pagina chama notFound() (ex.: /ofertas/id-que-nao-existe)
export default function NaoEncontrado() {
    return (
        <div className="pagina-404">
            <h1>404</h1>
            <p>Esta página não foi colhida — ou já virou doação. 🌱</p>
            <div className="acoes" style={{ justifyContent: 'center' }}>
                <Link className="btn btn-primario" href="/ofertas">Ver ofertas da semana</Link>
                <Link className="btn btn-secundario" href="/">Voltar para a Home</Link>
            </div>
        </div>
    )
}
