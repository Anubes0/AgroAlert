'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLoja } from '@/context/LojaContext'
import { useCiclo } from '@/context/CicloContext'
import { buscarProdutor } from '@/data/catalogo'
import { formatarQuantidade } from '@/lib/pedidos'
import { moeda } from '@/lib/taxas'
import type { Oferta } from '@/types'
import EtiquetasOferta from './EtiquetasOferta'
import { passoDa } from './SeletorQuantidade'

export default function CardOferta({ oferta }: { oferta: Oferta }) {
    const { disponivel, adicionarNaCesta, cesta } = useLoja()
    const { fase } = useCiclo()
    const [adicionado, setAdicionado] = useState(false)

    const produtor = buscarProdutor(oferta.produtorId)
    const naCesta = cesta.find((i) => i.ofertaId === oferta.id)?.quantidade ?? 0
    const restante = disponivel(oferta.id) - naCesta
    const passo = passoDa(oferta.unidade)
    const podeAdicionar = fase === 'aberto' && restante >= passo

    function adicionar() {
        adicionarNaCesta(oferta.id, passo)
        setAdicionado(true)
        setTimeout(() => setAdicionado(false), 1200)
    }

    return (
        <article className="card-oferta">
            {produtor && <EtiquetasOferta oferta={oferta} selo={produtor.selo} />}
            <h3>
                <Link href={`/ofertas/${oferta.id}`}>{oferta.produto}</Link>
            </h3>
            <p className="produtor-card">
                {produtor?.sitio} · {produtor?.cidade}
            </p>
            <p className="preco-oferta">
                {moeda(oferta.preco)} <small>/ {oferta.unidade}</small>
            </p>
            <div className="rodape-card">
                <span className={`disponivel ${restante < passo ? 'esgotado' : ''}`}>
                    {restante >= passo ? `${formatarQuantidade(restante, oferta.unidade)} disponíveis` : 'Esgotado neste ciclo'}
                </span>
                <button type="button" className="btn btn-primario btn-pequeno" disabled={!podeAdicionar} onClick={adicionar}>
                    {adicionado ? '✓ Na cesta' : `+ ${formatarQuantidade(passo, oferta.unidade)}`}
                </button>
            </div>
        </article>
    )
}
