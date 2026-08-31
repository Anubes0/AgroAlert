import './Hero.css'

// TODO: substituir pelo link real do Pitch Vídeo da Fase 5 no YouTube
const LINK_PITCH_VIDEO = 'https://www.youtube.com/watch?v=1jUB8DrwDGE'

function Hero({ navegarPara }) {
    return (
        <section id="secao-hero">

            {/* elementos decorativos de fundo */}
            <div id="grade-pontos" aria-hidden="true"></div>
            <div className="orb" id="orb1" aria-hidden="true"></div>
            <div className="orb" id="orb2" aria-hidden="true"></div>
            <div className="orb" id="orb3" aria-hidden="true"></div>
            <div id="linha-scan" aria-hidden="true"></div>

            {/* conteudo textual */}
            <div id="hero-conteudo-esq">

                <p id="badge-whatsapp">Bot via WhatsApp · 100% no celular · sem instalar app</p>

                <h1 id="titulo-hero">
                    <span className="linha-normal">Conecte seu</span><br />
                    <span className="linha-normal">produto com</span><br />
                    <span className="linha-destaque">compradores reais</span>
                </h1>

                <p id="subtitulo-hero">
                    Plataforma digital para reduzir desperdício e aumentar a renda de produtores rurais. Tudo via WhatsApp, sem instalar nada.
                </p>

                <div id="botoes-hero">
                    <button className="btn-verde" type="button" onClick={() => navegarPara('home', 'secao-planos')}>Assinar Agora ◉</button>
                    <button className="btn-fantasma" type="button" onClick={() => navegarPara('home', 'secao-como-funciona')}>Como Funciona ◉</button>
                </div>

                <a id="link-pitch-video" href={LINK_PITCH_VIDEO} target="_blank" rel="noopener noreferrer">▶ Assista ao nosso Pitch Vídeo</a>

                <ul id="barra-confianca">
                    <li className="item-confianca">Sem app</li>
                    <li className="item-confianca">Cancele quando quiser</li>
                    <li className="item-confianca">Alertas real</li>
                    <li className="item-confianca">Geolocalização</li>
                </ul>

                <div id="numeros-hero">
                    <div className="numero-stat">
                        <div className="valor">12 t</div>
                        <div className="label">de alimento salvo do desperdício</div>
                    </div>
                    <div className="numero-stat">
                        <div className="valor">850+</div>
                        <div className="label">produtores e compradores conectados</div>
                    </div>
                    <div className="numero-stat">
                        <div className="valor">~8 min</div>
                        <div className="label">até a 1ª proposta de compra</div>
                    </div>
                </div>

            </div>

            {/* mockup do chat whatsapp */}
            <div id="hero-chat" aria-hidden="true">
                <div id="janela-chat">
                    <div id="cabecalho-chat">
                        <div id="avatar-bot">A</div>
                        <div id="info-bot">
                            <strong>AgroAlert Bot</strong>
                            <p id="indicador-online">
                                <span id="ponto-online"></span>
                                Online agora
                            </p>
                        </div>
                    </div>
                    <div id="mensagens-chat">
                        <div className="mensagem-bot">Olá! Envie: produto, quantidade e preço</div>
                        <div className="mensagem-usuario">50kg tomate · R$0,80/kg – São Paulo</div>
                        <div className="mensagem-bot">◉ Buscando compradores num raio de 30km...</div>
                        <div className="mensagem-alerta">◉ 12 compradores notificados na região!</div>
                        <div className="mensagem-bot">◉ 3 interessados já responderam!</div>
                        <div className="mensagem-usuario">Toque para ver as propostas →</div>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default Hero
