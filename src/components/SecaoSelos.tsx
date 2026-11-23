import Link from 'next/link'
import { SELOS } from '@/data/rotulos'
import type { Selo } from '@/types'
import { SeloEtiqueta } from './EtiquetasOferta'

const ordem: Selo[] = ['certificado', 'ocs', 'transicao']

const destinos = [
    { titulo: 'Padrão', texto: 'Vai para as cestas dos consumidores.', classe: 'pilar-ambiental' },
    { titulo: 'Feio mas bom', texto: 'Fora do padrão de forma ou tamanho: vendido com desconto; o que sobrar vai em lote para a indústria.', classe: 'pilar-social' },
    { titulo: 'Sem valor comercial', texto: 'Vira doação para bancos de alimentos (Lei 14.016/2020). Nada volta para o lixo.', classe: 'pilar-economico' },
]

// selos de procedencia (Parte 1) + destino por classe de qualidade (Parte 2)
export default function SecaoSelos() {
    return (
        <section id="secao-selos" style={{ padding: '100px 80px' }}>
            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Procedência</p>
                <h2>Você sabe de onde vem — e o que é</h2>
                <p>Três selos com regras claras, porque &quot;orgânico&quot; é uma palavra protegida por lei</p>
            </div>

            <div className="grade-3 anima-scroll" style={{ maxWidth: 1100, margin: '0 auto 48px' }}>
                {ordem.map((selo) => (
                    <article className="caixa" key={selo}>
                        <SeloEtiqueta selo={selo} longo />
                        <p className="texto-fraco" style={{ marginTop: 12 }}>{SELOS[selo].descricao}</p>
                    </article>
                ))}
            </div>

            <div id="grade-pilares" className="anima-scroll">
                {destinos.map((d) => (
                    <article className={`card-pilar ${d.classe}`} key={d.titulo}>
                        <h3>{d.titulo}</h3>
                        <p>{d.texto}</p>
                    </article>
                ))}
            </div>

            <div className="centralizar-cta">
                <Link className="cta-pagina" href="/mapa">Ver pontos de retirada e associações no mapa →</Link>
            </div>
        </section>
    )
}
