import { useState } from 'react'
import './Faq.css'

const perguntas = [
    {
        pergunta: 'Preciso instalar algum aplicativo para usar?',
        resposta: 'Não. Todo o fluxo acontece pelo WhatsApp, direto no celular. Você envia uma mensagem de texto livre e o bot cuida do resto, sem precisar baixar nada.',
    },
    {
        pergunta: 'Como o sistema encontra compradores perto de mim?',
        resposta: 'Usamos georreferenciamento: ao receber seu anúncio, o bot notifica apenas compradores cadastrados dentro do raio configurado (de 5 a 100 km, conforme o plano).',
    },
    {
        pergunta: 'Existe fidelidade ou multa por cancelamento?',
        resposta: 'Nenhuma. Os planos são sem fidelidade e você pode cancelar quando quiser, sem multa. Ainda oferecemos 7 dias grátis para testar.',
    },
    {
        pergunta: 'Qual a diferença entre cobrança mensal e anual?',
        resposta: 'O valor é o mesmo serviço; na opção anual você paga o equivalente a 10 meses e ganha 2 meses grátis. Use o seletor na seção de Planos para comparar.',
    },
    {
        pergunta: 'Meus dados estão protegidos?',
        resposta: 'Sim. Tratamos seus dados de acordo com a LGPD (Lei nº 13.709/2018). Você só compartilha o que for necessário para conectar produtor e comprador.',
    },
]

function Faq() {
    // guarda o indice do item aberto (so um por vez, igual ao acordeao original)
    const [abertoIndex, setAbertoIndex] = useState(null)

    function alternar(indice) {
        setAbertoIndex((atual) => (atual === indice ? null : indice))
    }

    return (
        <section id="secao-faq">

            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Dúvidas</p>
                <h2>Perguntas Frequentes</h2>
                <p>O que produtores e compradores mais perguntam antes de começar</p>
            </div>

            <div id="lista-faq" className="anima-scroll">
                {perguntas.map((item, indice) => {
                    const aberto = abertoIndex === indice
                    return (
                        <div className="item-faq" key={item.pergunta}>
                            <button
                                className="pergunta-faq"
                                type="button"
                                aria-expanded={aberto}
                                onClick={() => alternar(indice)}
                            >
                                <span>{item.pergunta}</span>
                                <span className="seta-faq" aria-hidden="true">+</span>
                            </button>
                            <div className={`resposta-faq${aberto ? ' aberta' : ''}`}>
                                <div className="resposta-faq-interior">
                                    <p>{item.resposta}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

        </section>
    )
}

export default Faq
