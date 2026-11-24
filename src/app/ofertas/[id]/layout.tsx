import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { buscarProdutor, ofertasIniciais } from '@/data/catalogo'

// a pagina do detalhe e um Client Component (nao exporta metadata), entao o
// titulo da aba sai deste layout do segmento. generateMetadata roda no
// servidor com o [id] da URL: "Morango · Sítio Boa Vista · AgroAlert".
// (no Next 16, params chega como Promise)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const oferta = ofertasIniciais.find((o) => o.id === id)
    if (!oferta) return { title: 'Oferta' }
    const produtor = buscarProdutor(oferta.produtorId)
    return {
        title: produtor ? `${oferta.produto} · ${produtor.sitio}` : oferta.produto,
        description: oferta.descricao,
    }
}

export default function Layout({ children }: { children: ReactNode }) {
    return children
}
