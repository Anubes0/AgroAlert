import { useState } from 'react'
import './Contato.css'

// conta apenas letras (inclusive acentuadas) de uma palavra
function contarLetras(palavra) {
    const letras = palavra.match(/[A-Za-zÀ-ÿ]/g)
    return letras ? letras.length : 0
}

function formatarTelefone(valorBruto) {
    let valor = valorBruto.replace(/\D/g, '').slice(0, 11)
    if (valor.length <= 10) {
        valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, (m, a, b, c) => (c ? `(${a}) ${b}-${c}` : b ? `(${a}) ${b}` : `(${a}`))
    } else {
        valor = valor.replace(/(\d{2})(\d{1})(\d{4})(\d{0,4})/, (m, a, b, c, d) => `(${a}) ${b} ${c}-${d}`)
    }
    return valor
}

const valoresIniciais = {
    nome: '',
    email: '',
    telefone: '',
    tipo: '',
    cidade: '',
    mensagem: '',
    lgpd: false,
}

function Contato({ navegarPara, planoInteresse }) {
    const [campos, setCampos] = useState(valoresIniciais)
    const [erros, setErros] = useState({})
    const [tocados, setTocados] = useState({})
    const [enviado, setEnviado] = useState(false)

    function validarCampo(nomeCampo, valores) {
        switch (nomeCampo) {
            case 'nome': {
                const partes = valores.nome.trim().split(/\s+/).filter((p) => p.length > 0)
                if (valores.nome.trim() === '') return 'Por favor, preencha seu nome completo'
                if (partes.length < 2) return 'Informe o nome e o sobrenome'
                if (partes.some((p) => contarLetras(p) < 2)) return 'Nome e sobrenome devem ter ao menos 2 letras cada'
                return ''
            }
            case 'email': {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                return regex.test(valores.email.trim()) ? '' : 'E-mail inválido'
            }
            case 'telefone':
                return valores.telefone.trim().length >= 10 ? '' : 'Telefone obrigatório'
            case 'mensagem': {
                const tamanho = valores.mensagem.trim().length
                return tamanho >= 15 && tamanho <= 500 ? '' : 'A mensagem deve ter entre 15 e 500 caracteres'
            }
            case 'lgpd':
                return valores.lgpd ? '' : 'Aceite a Política de Privacidade para continuar'
            default:
                return ''
        }
    }

    function atualizarCampo(nomeCampo, valor) {
        const novosCampos = { ...campos, [nomeCampo]: valor }
        setCampos(novosCampos)
        // so revalida ao vivo se o campo ja foi tocado (ja mostrou erro antes)
        if (tocados[nomeCampo]) {
            setErros((atual) => ({ ...atual, [nomeCampo]: validarCampo(nomeCampo, novosCampos) }))
        }
    }

    function aoSairDoCampo(nomeCampo) {
        setTocados((atual) => ({ ...atual, [nomeCampo]: true }))
        setErros((atual) => ({ ...atual, [nomeCampo]: validarCampo(nomeCampo, campos) }))
    }

    function aoEnviar(e) {
        e.preventDefault()

        const camposObrigatorios = ['nome', 'email', 'telefone', 'mensagem', 'lgpd']
        const novosErros = {}
        camposObrigatorios.forEach((c) => { novosErros[c] = validarCampo(c, campos) })

        setErros(novosErros)
        setTocados({ nome: true, email: true, telefone: true, mensagem: true, lgpd: true })

        const temErro = Object.values(novosErros).some((msg) => msg !== '')
        if (temErro) return

        setEnviado(true)
    }

    const contadorMensagem = campos.mensagem.length
    const classeContador = contadorMensagem >= 500 ? 'limite' : contadorMensagem >= 450 ? 'alerta' : ''

    return (
        <section id="secao-contato">

            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Fale Conosco</p>
                <h2>Entre em Contato</h2>
                <p>Ficou com dúvida? Manda uma mensagem!</p>
            </div>

            <div id="container-contato" className="anima-scroll">

                {/* informacoes de contato */}
                <div id="painel-info-contato">
                    <p id="titulo-info-contato">Informações</p>
                    <p id="subtitulo-info-contato">de Contato</p>

                    <div className="item-contato">
                        <span className="icone-contato-bg" aria-hidden="true">📱</span>
                        <div>
                            <strong>WhatsApp</strong>
                            <p>+55 (11) 99999-9999</p>
                        </div>
                    </div>

                    <div className="item-contato">
                        <span className="icone-contato-bg" aria-hidden="true">✉️</span>
                        <div>
                            <strong>E-mail</strong>
                            <p>contato@agroalert.com.br</p>
                        </div>
                    </div>

                    <div className="item-contato">
                        <span className="icone-contato-bg" aria-hidden="true">📍</span>
                        <div>
                            <strong>Região</strong>
                            <p>Grande São Paulo · Exp. 2026</p>
                        </div>
                    </div>
                </div>

                {/* formulario de contato */}
                <div id="painel-formulario">

                    {!enviado ? (
                        <form id="formulario-principal" onSubmit={aoEnviar} noValidate>
                            <h3>Envie sua mensagem</h3>

                            <div className="grade-campos">
                                <div className="campo-grupo">
                                    <label htmlFor="campo-nome">Nome completo *</label>
                                    <input
                                        type="text"
                                        id="campo-nome"
                                        name="nome"
                                        placeholder="Seu nome"
                                        required
                                        autoComplete="name"
                                        value={campos.nome}
                                        onChange={(e) => atualizarCampo('nome', e.target.value)}
                                        onBlur={() => aoSairDoCampo('nome')}
                                    />
                                    {erros.nome && <span className="msg-erro visivel">{erros.nome}</span>}
                                </div>
                                <div className="campo-grupo">
                                    <label htmlFor="campo-email">E-mail *</label>
                                    <input
                                        type="email"
                                        id="campo-email"
                                        name="email"
                                        placeholder="seu@email.com"
                                        required
                                        autoComplete="email"
                                        value={campos.email}
                                        onChange={(e) => atualizarCampo('email', e.target.value)}
                                        onBlur={() => aoSairDoCampo('email')}
                                    />
                                    {erros.email && <span className="msg-erro visivel">{erros.email}</span>}
                                </div>
                            </div>

                            <div className="grade-campos">
                                <div className="campo-grupo">
                                    <label htmlFor="campo-telefone">Telefone *</label>
                                    <input
                                        type="tel"
                                        id="campo-telefone"
                                        name="telefone"
                                        placeholder="(11) 99999-9999"
                                        required
                                        maxLength={16}
                                        autoComplete="tel"
                                        value={campos.telefone}
                                        onChange={(e) => atualizarCampo('telefone', formatarTelefone(e.target.value))}
                                        onBlur={() => aoSairDoCampo('telefone')}
                                    />
                                    {erros.telefone && <span className="msg-erro visivel">{erros.telefone}</span>}
                                </div>
                                <div className="campo-grupo">
                                    <label htmlFor="campo-tipo">Você é *</label>
                                    <select
                                        id="campo-tipo"
                                        name="tipo"
                                        required
                                        value={campos.tipo}
                                        onChange={(e) => atualizarCampo('tipo', e.target.value)}
                                    >
                                        <option value="" disabled>Selecione...</option>
                                        <option value="produtor">Produtor rural</option>
                                        <option value="comprador">Comprador B2B</option>
                                        <option value="restaurante">Restaurante</option>
                                        <option value="mercado">Supermercado</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="campo-grupo" id="campo-plano-interesse">
                                <label htmlFor="campo-plano">Plano de interesse</label>
                                <input type="text" id="campo-plano" name="plano" value={planoInteresse} readOnly />
                            </div>

                            <div className="campo-grupo">
                                <label htmlFor="campo-cidade">Cidade / Região</label>
                                <input
                                    type="text"
                                    id="campo-cidade"
                                    name="cidade"
                                    placeholder="Ex: São Paulo - SP"
                                    autoComplete="address-level2"
                                    value={campos.cidade}
                                    onChange={(e) => atualizarCampo('cidade', e.target.value)}
                                />
                            </div>

                            <div className="campo-grupo">
                                <label htmlFor="campo-mensagem">Mensagem * (mínimo 15, máximo 500 caracteres)</label>
                                <textarea
                                    id="campo-mensagem"
                                    name="mensagem"
                                    placeholder="Conte um pouco sobre o que você precisa..."
                                    required
                                    minLength={15}
                                    maxLength={500}
                                    value={campos.mensagem}
                                    onChange={(e) => atualizarCampo('mensagem', e.target.value)}
                                    onBlur={() => aoSairDoCampo('mensagem')}
                                ></textarea>
                                <span className={`contador-caracteres ${classeContador}`}>{contadorMensagem}/500</span>
                                {erros.mensagem && <span className="msg-erro visivel">{erros.mensagem}</span>}
                            </div>

                            <div id="grupo-lgpd">
                                <input
                                    type="checkbox"
                                    id="checkbox-lgpd"
                                    name="lgpd"
                                    checked={campos.lgpd}
                                    onChange={(e) => atualizarCampo('lgpd', e.target.checked)}
                                />
                                <label htmlFor="checkbox-lgpd">
                                    Concordo com a{' '}
                                    <button
                                        type="button"
                                        className="link-verde link-como-texto"
                                        onClick={() => navegarPara('privacidade', 'lgpd')}
                                    >
                                        Política de Privacidade — LGPD
                                    </button>{' '}*
                                </label>
                            </div>
                            {erros.lgpd && <span className="msg-erro visivel msg-erro-lgpd">{erros.lgpd}</span>}

                            <button id="btn-enviar" type="submit">Enviar Mensagem ◉</button>
                        </form>
                    ) : (
                        <div id="mensagem-confirmacao" className="visivel">
                            <div className="icone-ok">✅</div>
                            <h4>Mensagem enviada!</h4>
                            <p>Recebemos seu contato e vamos responder em breve via WhatsApp ou e-mail.</p>
                        </div>
                    )}

                </div>
            </div>

        </section>
    )
}

export default Contato
