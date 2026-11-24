import type { Metadata } from 'next'
import Link from 'next/link'
import SimuladorFinanceiro from '@/components/SimuladorFinanceiro'
import Planos from '@/components/Planos'
import { COMISSAO_TOTAL } from '@/lib/taxas'
import '@/styles/PaginaInterna.css'

export const metadata: Metadata = {
    title: 'Para produtores',
    description: 'Agricultor familiar entra grátis pela associação, colhe só o que foi vendido e recebe com pagamento garantido.',
}

// o que o painel do produtor faz — cada item corresponde a uma aba de /painel
const recursos = [
    {
        icone: '📋',
        titulo: 'Ofertas da semana',
        texto: 'Publique na segunda o que espera colher: quantidade máxima, preço e classe (padrão ou “feio mas bom”).',
    },
    {
        icone: '🌦',
        titulo: 'Alerta de clima',
        texto: 'Previsão da sua propriedade com ação sugerida: antecipar a colheita antes da geada ou reduzir o prometido.',
    },
    {
        icone: '🧾',
        titulo: 'Administração',
        texto: 'Na quarta 20h chega o romaneio: a lista do que colher e para quem. Faltou algo? Registre a falta e o item é estornado ao cliente.',
    },
    {
        icone: '💰',
        titulo: 'Extrato',
        texto: 'Acompanhe o valor retido e o liberado após cada retirada, com a comissão descontada linha a linha.',
    },
]

const passosEntrada = [
    { numero: '1', titulo: 'Pela associação', texto: 'O cadastro é feito com a associação da sua região (cadastro assistido), que também confere a qualidade.' },
    { numero: '2', titulo: 'Selo de procedência', texto: 'Certificado, OCS ou em transição: o selo aparece em todas as suas ofertas.' },
    { numero: '3', titulo: 'Uma entrega por semana', texto: 'Você leva as caixas ao hub no sábado cedo; a rota compartilhada faz o resto.' },
]

// rota "/produtores" — tudo o que interessa a quem vende fica nesta pagina,
// e a Home fica focada em quem compra
export default function ProdutoresPagina() {
    const comissao = Math.round(COMISSAO_TOTAL * 100)

    return (
        <>
            <section className="hero-pagina hero-produtor">
                <p className="badge-secao">Para agricultores familiares</p>
                <h1>Colha só o que já foi vendido</h1>
                <p>
                    Sem mensalidade e sem atravessador: você publica a oferta, o consumidor paga antes e você recebe{' '}
                    {100 - comissao}% do valor depois que o cliente retira e confirma — com uma única entrega por semana no hub da associação.
                </p>
                <div className="botoes-pagina">
                    <Link className="btn btn-primario" href="/entrar?perfil=produtor">Entrar como produtor →</Link>
                    <a className="btn btn-secundario" href="#secao-simulador-financeiro">Simular minha renda</a>
                </div>
                <ul className="numeros-produtor">
                    <li><b>R$ 0</b><span>de mensalidade</span></li>
                    <li><b>{100 - comissao}%</b><span>do valor fica com você</span></li>
                    <li><b>1</b><span>entrega por semana, no hub</span></li>
                </ul>
            </section>

            <SimuladorFinanceiro />

            <section className="secao-recursos">
                <div className="titulo-secao anima-scroll">
                    <p className="badge-secao">Seu painel</p>
                    <h2>O que você faz no AgroAlert</h2>
                    <p>Tudo pelo celular — ou com ajuda da associação</p>
                </div>
                <div className="grade-recursos anima-scroll">
                    {recursos.map((r) => (
                        <article className="caixa recurso" key={r.titulo}>
                            <span className="icone-recurso" aria-hidden="true">{r.icone}</span>
                            <h3>{r.titulo}</h3>
                            <p>{r.texto}</p>
                        </article>
                    ))}
                </div>
            </section>

            <Planos semConsumidor />

            <section className="secao-recursos">
                <div className="titulo-secao anima-scroll">
                    <p className="badge-secao">Como entrar</p>
                    <h2>Três passos para vender no próximo ciclo</h2>
                </div>
                <ol className="grade-passos-entrada anima-scroll">
                    {passosEntrada.map((p) => (
                        <li className="caixa" key={p.numero}>
                            <span className="marcador-passo" aria-hidden="true">{p.numero}</span>
                            <h3>{p.titulo}</h3>
                            <p>{p.texto}</p>
                        </li>
                    ))}
                </ol>
                <div className="faixa-cta anima-scroll">
                    <div>
                        <h3>Sua associação ainda não participa?</h3>
                        <p>Conte onde vocês estão e o que produzem — o piloto começa pela Grande São Paulo.</p>
                    </div>
                    <Link className="btn btn-primario" href="/#secao-contato">Falar com a gente</Link>
                </div>
            </section>
        </>
    )
}
