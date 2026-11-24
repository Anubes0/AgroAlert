import ImpactoAoVivo from './ImpactoAoVivo'
import './Impacto.css'

const pilares = [
    {
        classe: 'pilar-ambiental',
        titulo: 'Impacto Ambiental',
        texto: 'Colher só o que foi vendido evita a perda no campo; o fora de padrão vai para a indústria e o resto para doação.',
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6" />
            </svg>
        ),
    },
    {
        classe: 'pilar-social',
        titulo: 'Impacto Social',
        texto: 'Doação de sobras (Lei 14.016/2020) e inclusão do agricultor familiar via associação, com cadastro assistido.',
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        classe: 'pilar-economico',
        titulo: 'Impacto Econômico',
        texto: 'Capital direto ao produtor e desenvolvimento rural. 85% do valor vai ao produtor — cerca do dobro do que o atravessador paga.',
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8.5h-5a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H8" />
                <path d="M12 6v2M12 16v2" />
            </svg>
        ),
    },
]

export default function Impacto() {
    return (
        <section id="secao-impacto">

            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Por que importa</p>
                <h2>Nosso impacto</h2>
                <p>Quanto falta para a meta do piloto e o que este ciclo já rendeu para quem planta</p>
            </div>

            <ImpactoAoVivo />

            <div id="banner-ods" className="anima-scroll">
                <span id="badge-ods">2</span>
                <div id="texto-ods">
                    <h4>Alinhado às Metas ODS 2 da ONU</h4>
                    <p>Meta 2.3: dobrar produtividade e renda · Meta 2.4: sistemas sustentáveis de produção</p>
                </div>
            </div>

            <div id="grade-pilares" className="anima-scroll">
                {pilares.map((pilar) => (
                    <article className={`card-pilar ${pilar.classe}`} key={pilar.classe}>
                        <span className="icone-pilar" aria-hidden="true">{pilar.icone}</span>
                        <h3>{pilar.titulo}</h3>
                        <p>{pilar.texto}</p>
                    </article>
                ))}
            </div>

        </section>
    )
}

