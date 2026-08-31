import './Impacto.css'

const pilares = [
    {
        classe: 'pilar-ambiental',
        titulo: 'Impacto Ambiental',
        texto: 'Redução de GEE e resíduos orgânicos. Menos desperdício na cadeia produtiva, menos emissões de gases de efeito estufa.',
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
        texto: 'Segurança alimentar e inclusão digital para o pequeno produtor rural que hoje depende de intermediários.',
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
        texto: 'Capital direto ao produtor e desenvolvimento rural. Elimina a margem do intermediário, dobrando a renda estimada.',
        icone: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8.5h-5a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H8" />
                <path d="M12 6v2M12 16v2" />
            </svg>
        ),
    },
]

function Impacto() {
    return (
        <section id="secao-impacto">

            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Por que importa</p>
                <h2>Nosso Impacto</h2>
                <p>Alinhado às Metas ODS 2 da ONU</p>
            </div>

            <div id="grade-numeros" className="anima-scroll">
                <div>
                    <p className="numero-impacto">30%</p>
                    <p className="label-impacto">da produção nacional é desperdiçada · fonte: EMBRAPA/FAO</p>
                </div>
                <div>
                    <p className="numero-impacto">4,1 mi</p>
                    <p className="label-impacto">de produtores familiares no Brasil · IBGE Censo Agro</p>
                </div>
                <div>
                    <p className="numero-impacto">+62%</p>
                    <p className="label-impacto">de renda estimada com escoamento direto</p>
                </div>
            </div>

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

export default Impacto
