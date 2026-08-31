import { useState } from 'react'
import Hero from '../components/Hero'
import ComoFunciona from '../components/ComoFunciona'
import Planos from '../components/Planos'
import Impacto from '../components/Impacto'
import Faq from '../components/Faq'
import Contato from '../components/Contato'
import useAnimaScroll from '../hooks/useAnimaScroll'

function Home({ navegarPara }) {
    const [planoInteresse, setPlanoInteresse] = useState('Produtor Pro — R$ 89/mês')

    useAnimaScroll('home')

    function aoSelecionarPlano(nomePlano) {
        setPlanoInteresse(nomePlano)
        // mesma pausa da versao original: da tempo do usuario ver o card
        // destacado antes de rolar ate o formulario de contato
        setTimeout(() => navegarPara('home', 'secao-contato'), 600)
    }

    return (
        <>
            <Hero navegarPara={navegarPara} />
            <ComoFunciona navegarPara={navegarPara} />
            <Planos onSelecionarPlano={aoSelecionarPlano} />
            <Impacto />
            <Faq />
            <Contato navegarPara={navegarPara} planoInteresse={planoInteresse} />
        </>
    )
}

export default Home
