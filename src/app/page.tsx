import Hero from '@/components/Hero'
import ComoFunciona from '@/components/ComoFunciona'
import SimuladorFinanceiro from '@/components/SimuladorFinanceiro'
import SecaoSelos from '@/components/SecaoSelos'
import Planos from '@/components/Planos'
import Impacto from '@/components/Impacto'
import Faq from '@/components/Faq'
import Contato from '@/components/Contato'
import '@/components/Impacto.css'

// rota "/" — Server Component que compoe as secoes da Home.
// As secoes interativas (comparador, FAQ, contato, contagem) sao Client
// Components; o resto e HTML gerado no servidor.
export default function Home() {
    return (
        <>
            <Hero />
            <ComoFunciona />
            <SimuladorFinanceiro />
            <SecaoSelos />
            <Planos />
            <Impacto />
            <Faq />
            <Contato />
        </>
    )
}
