import Link from 'next/link'
import { COMISSAO_TOTAL, TAXAS } from '@/lib/taxas'
import './Hero.css'

// TODO (equipe): colar aqui o link PUBLICO do Pitch Video da Fase 7 no YouTube
// e fazer o deploy de novo (o enunciado exige o link na Home)
export const LINK_PITCH_VIDEO = ''

export default function Hero() {
    return (
        <section id="secao-hero">
            {/* elementos decorativos de fundo */}
            <div id="grade-pontos" aria-hidden="true"></div>
            <div className="orb" id="orb1" aria-hidden="true"></div>
            <div className="orb" id="orb2" aria-hidden="true"></div>
            <div className="orb" id="orb3" aria-hidden="true"></div>
            <div id="linha-scan" aria-hidden="true"></div>

            <div id="hero-conteudo-esq">
                <p id="badge-whatsapp">Ciclo semanal · colheita sob encomenda · retirada perto de você</p>

                <h1 id="titulo-hero">
                    <span className="linha-normal">Venda sua colheita</span><br />
                    <span className="linha-normal">antes que ela</span><br />
                    <span className="linha-destaque">vire perda</span>
                </h1>

                <p id="subtitulo-hero">
                    Hortifrúti natural de agricultores familiares: você encomenda até quarta, o produtor colhe só o
                    que foi vendido e entrega no sábado num ponto de retirada do seu bairro — com frete dividido entre vizinhos.
                </p>

                <div id="botoes-hero">
                    <Link className="btn-verde" href="/ofertas">Ver ofertas da semana ◉</Link>
                    <Link className="btn-fantasma" href="/entrar?perfil=produtor">Sou produtor ◉</Link>
                </div>

                {LINK_PITCH_VIDEO ? (
                    <a id="link-pitch-video" href={LINK_PITCH_VIDEO} target="_blank" rel="noopener noreferrer">
                        ▶ Assista ao nosso Pitch Vídeo
                    </a>
                ) : (
                    <span id="link-pitch-video" aria-disabled="true">▶ Pitch Vídeo da Fase 7 — link em breve</span>
                )}

                <ul id="barra-confianca">
                    <li className="item-confianca">Produtor entra grátis</li>
                    <li className="item-confianca">Pagamento protegido</li>
                    <li className="item-confianca">Selo de procedência</li>
                    <li className="item-confianca">Alerta de clima</li>
                </ul>

                <div id="numeros-hero">
                    <div className="numero-stat">
                        <div className="valor">{Math.round(COMISSAO_TOTAL * 100)}%</div>
                        <div className="label">só quando o produtor vende — sem mensalidade</div>
                    </div>
                    <div className="numero-stat">
                        <div className="valor">R$ {TAXAS.taxaRetirada}</div>
                        <div className="label">de taxa de retirada por pedido</div>
                    </div>
                    <div className="numero-stat">
                        <div className="valor">~2×</div>
                        <div className="label">o que o atravessador paga ao produtor</div>
                    </div>
                </div>
            </div>

            {/* mockup dos avisos que o consumidor recebe ao longo do ciclo */}
            <div id="hero-chat" aria-hidden="true">
                <div id="janela-chat">
                    <div id="cabecalho-chat">
                        <div id="avatar-bot">A</div>
                        <div id="info-bot">
                            <strong>AgroAlert · Avisos</strong>
                            <p id="indicador-online">
                                <span id="ponto-online"></span>
                                Ciclo da semana
                            </p>
                        </div>
                    </div>
                    <div id="mensagens-chat">
                        <div className="mensagem-bot">🟢 Encomendas abertas até quarta, 20h!</div>
                        <div className="mensagem-usuario">Cesta: alface, tomate, morango · R$ 42,50</div>
                        <div className="mensagem-bot">✓ Pix confirmado · valor retido até a retirada</div>
                        <div className="mensagem-alerta">⚠ Geada prevista — Sítio Pé de Serra antecipou a couve</div>
                        <div className="mensagem-bot">📦 Sábado 9h–13h · Empório Grão Natural · AG-2741</div>
                        <div className="mensagem-usuario">Retirado ✓ — repasse liberado ao produtor</div>
                    </div>
                </div>
            </div>
        </section>
    )
}
