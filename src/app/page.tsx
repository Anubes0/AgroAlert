import Link from 'next/link'
import Hero from '@/components/Hero'
import ComoFunciona from '@/components/ComoFunciona'
import OfertasDestaque from '@/components/OfertasDestaque'
import SecaoSelos from '@/components/SecaoSelos'
import Impacto from '@/components/Impacto'
import Faq from '@/components/Faq'
import Contato from '@/components/Contato'
import { COMISSAO_TOTAL } from '@/lib/taxas'

// rota "/" — Server Component que compoe as secoes da Home, focada em quem
// compra. O que e do produtor (comparador de renda, planos) fica em
// /produtores. As secoes interativas sao Client Components.
export default function Home() {
    return (
        <>
            <Hero />
            <ComoFunciona />
            <OfertasDestaque />
            <SecaoSelos />

            <section className="faixa-produtor">
                <div className="faixa-cta anima-scroll">
                    <div>
                        <p className="badge-secao">É produtor?</p>
                        <h2>Venda sem atravessador e sem mensalidade</h2>
                        <p>
                            Você fica com {100 - Math.round(COMISSAO_TOTAL * 100)}% do valor e entrega uma vez por semana no hub
                            da associação. Simule quanto sobraria no seu bolso.
                        </p>
                    </div>
                    <Link className="btn btn-primario" href="/produtores">Ver como funciona para produtores →</Link>
                </div>
            </section>

            <Impacto />
            <Faq />
            <Contato />
        </>
    )
}
