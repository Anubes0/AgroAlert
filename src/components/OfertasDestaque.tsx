'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useLoja } from '@/context/LojaContext'
import CardOferta from './CardOferta'

const QUANTIDADE = 3

// vitrine resumida da Home: as ofertas mais fartas da semana, uma por
// produtor, para quem chega ver o produto antes de ler sobre o modelo
export default function OfertasDestaque() {
    const { ofertas, statusOfertas, disponivel } = useLoja()

    const destaques = useMemo(() => {
        const vistos = new Set<string>()
        return [...ofertas]
            .sort((a, b) => disponivel(b.id) - disponivel(a.id))
            .filter((o) => {
                if (vistos.has(o.produtorId)) return false
                vistos.add(o.produtorId)
                return true
            })
            .slice(0, QUANTIDADE)
    }, [ofertas, disponivel])

    return (
        <section id="secao-destaques">
            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Nesta semana</p>
                <h2>O que está farto na roça</h2>
                <p>Encomende até quarta, 20h, e retire no sábado perto de você</p>
            </div>

            <div className="grade-destaques" aria-busy={statusOfertas === 'carregando'}>
                {statusOfertas === 'ok'
                    ? destaques.map((oferta) => <CardOferta key={oferta.id} oferta={oferta} />)
                    : Array.from({ length: QUANTIDADE }, (_, i) => <div className="esqueleto" key={i} />)}
            </div>

            <div className="centralizar-cta">
                <Link className="cta-pagina" href="/ofertas">
                    {statusOfertas === 'ok' ? `Ver todas as ${ofertas.length} ofertas da semana →` : 'Ver todas as ofertas da semana →'}
                </Link>
            </div>
        </section>
    )
}
