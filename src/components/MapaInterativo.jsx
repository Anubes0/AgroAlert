import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { produtores, compradores, produtosDisponiveis } from '../data/pontosMapa'
import {
    buscarLocal,
    buscarClima,
    gerarAlertas,
    descreverTempo,
    formatarDia,
    calcularDistanciaKm,
} from '../services/mapaApi'
import './MapaInterativo.css'

const CENTRO_INICIAL = [-22.95, -47.0]
const ZOOM_INICIAL = 9
const RAIO_PADRAO_KM = 30

const todosPontos = [...produtores, ...compradores]

const filtrosTipo = [
    { valor: 'todos', rotulo: 'Todos' },
    { valor: 'produtor', rotulo: 'Produtores' },
    { valor: 'comprador', rotulo: 'Compradores' },
]

const rotulosTipo = {
    produtor: 'Oferta de produtor',
    comprador: 'Comprador cadastrado',
    local: 'Local escolhido',
}

// camadas de fundo (todas gratuitas e sem chave de API)
function criarCamadasBase() {
    const urlOsm = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    const creditoOsm = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

    return {
        // mesmo tile do OSM, escurecido por filtro CSS (.camada-escura)
        // pra combinar com o tema do site
        Escuro: L.tileLayer(urlOsm, { attribution: creditoOsm, maxZoom: 19, className: 'camada-escura' }),
        Ruas: L.tileLayer(urlOsm, { attribution: creditoOsm, maxZoom: 19 }),
        Satélite: L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            { attribution: 'Imagens &copy; Esri', maxZoom: 19 }
        ),
    }
}

// pino desenhado so com CSS (divIcon), assim nao dependemos das imagens
// padrao do Leaflet, que costumam quebrar quando o Vite empacota o projeto
function criarIcone(tipo, destacado, selecionado) {
    const classes = ['pino-mapa', `pino-${tipo}`]
    if (destacado) classes.push('pino-destacado')
    if (selecionado) classes.push('pino-selecionado')

    return L.divIcon({
        className: '',
        html: `<span class="${classes.join(' ')}"></span>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    })
}

function combinaComProduto(ponto, produto) {
    if (produto === 'todos') return true
    return ponto.tipo === 'produtor' ? ponto.produto === produto : ponto.interesses.includes(produto)
}

// "filtro duplo" da etapa de matching: alem de estar no raio, o ponto
// precisa ter interesse no que o selecionado vende (ou vice-versa)
function interessaAoSelecionado(ponto, selecionado, filtroProduto) {
    if (selecionado.tipo === 'produtor') return ponto.interesses.includes(selecionado.produto)
    if (selecionado.tipo === 'comprador') return selecionado.interesses.includes(ponto.produto)
    return combinaComProduto(ponto, filtroProduto)
}

function formatarKm(valor) {
    return `${valor.toFixed(1).replace('.', ',')} km`
}

function ResumoClima({ clima }) {
    if (clima.status === 'carregando') {
        return <p className="clima-status">Consultando a previsão na Open-Meteo...</p>
    }

    if (clima.status === 'erro') {
        return <p className="clima-status clima-erro">Não foi possível carregar o clima agora. Tente selecionar o ponto de novo.</p>
    }

    if (clima.status !== 'ok') return null

    const { atual, previsao } = clima.dados
    const tempoAtual = descreverTempo(atual.codigo)
    const alertas = gerarAlertas(clima.dados)

    return (
        <>
            <div className="clima-atual">
                <span className="icone-clima" aria-hidden="true">{tempoAtual.icone}</span>
                <div>
                    <p className="temperatura-atual">{Math.round(atual.temperatura)}°C</p>
                    <p className="descricao-tempo">{tempoAtual.texto}</p>
                </div>
            </div>

            <ul className="indicadores-clima">
                <li><span>Umidade</span>{atual.umidade}%</li>
                <li><span>Vento</span>{Math.round(atual.vento)} km/h</li>
                <li><span>Chuva</span>{atual.chuvaMm.toString().replace('.', ',')} mm</li>
            </ul>

            <div className="previsao-dias">
                {previsao.map((dia) => {
                    const tempo = descreverTempo(dia.codigo)
                    return (
                        <div className="dia-previsao" key={dia.data} title={tempo.texto}>
                            <span className="nome-dia">{formatarDia(dia.data)}</span>
                            <span className="icone-dia" aria-hidden="true">{tempo.icone}</span>
                            <span className="temperaturas-dia">
                                {Math.round(dia.maxima)}° <small>{Math.round(dia.minima)}°</small>
                            </span>
                            <span className="chuva-dia">💧 {dia.chanceChuva ?? 0}%</span>
                        </div>
                    )
                })}
            </div>

            <h4 className="subtitulo-painel">Alertas para o campo</h4>
            {alertas.length ? (
                <ul className="lista-alertas">
                    {alertas.map((alerta, i) => (
                        <li className={`alerta alerta-${alerta.nivel}`} key={`${alerta.titulo}-${i}`}>
                            <strong>{alerta.titulo}</strong>
                            <p>{alerta.descricao}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="sem-alertas">✓ Nenhum alerta climático para os próximos 4 dias.</p>
            )}
        </>
    )
}

function MapaInterativo() {
    const elementoMapaRef = useRef(null)
    const mapaRef = useRef(null)
    const camadaPontosRef = useRef(null)

    const [filtroTipo, setFiltroTipo] = useState('todos')
    const [filtroProduto, setFiltroProduto] = useState('todos')
    const [raioKm, setRaioKm] = useState(RAIO_PADRAO_KM)
    const [selecionado, setSelecionado] = useState(null)
    // ultimo clima recebido e de qual ponto ele e (ver "clima" mais abaixo)
    const [climaRecebido, setClimaRecebido] = useState({ ponto: null, status: 'ocioso', dados: null })
    const [textoBusca, setTextoBusca] = useState('')
    const [statusBusca, setStatusBusca] = useState({ tipo: null, mensagem: '' })

    const pontosVisiveis = useMemo(
        () =>
            todosPontos.filter(
                (ponto) =>
                    (filtroTipo === 'todos' || ponto.tipo === filtroTipo) &&
                    combinaComProduto(ponto, filtroProduto)
            ),
        [filtroTipo, filtroProduto]
    )

    // quem esta dentro da area de venda do ponto selecionado: se o
    // selecionado e um comprador, mostramos ofertas; senao, compradores
    const proximos = useMemo(() => {
        if (!selecionado) return []
        const tipoAlvo = selecionado.tipo === 'comprador' ? 'produtor' : 'comprador'

        return todosPontos
            .filter((ponto) => ponto.tipo === tipoAlvo && interessaAoSelecionado(ponto, selecionado, filtroProduto))
            .map((ponto) => ({ ...ponto, distancia: calcularDistanciaKm(selecionado, ponto) }))
            .filter((ponto) => ponto.distancia <= raioKm)
            .sort((a, b) => a.distancia - b.distancia)
    }, [selecionado, raioKm, filtroProduto])

    // cria o mapa uma unica vez (e destroi ao sair da Home)
    useEffect(() => {
        const mapa = L.map(elementoMapaRef.current, {
            center: CENTRO_INICIAL,
            zoom: ZOOM_INICIAL,
            // a roda do mouse so da zoom depois de clicar no mapa,
            // pra nao "prender" a rolagem da pagina
            scrollWheelZoom: false,
        })

        const camadasBase = criarCamadasBase()
        camadasBase.Escuro.addTo(mapa)
        L.control.layers(camadasBase, null, { position: 'topright' }).addTo(mapa)

        camadaPontosRef.current = L.layerGroup().addTo(mapa)
        mapaRef.current = mapa

        mapa.on('focus', () => mapa.scrollWheelZoom.enable())
        mapa.on('blur', () => mapa.scrollWheelZoom.disable())

        // clicar em qualquer lugar do mapa seleciona aquele ponto
        mapa.on('click', (evento) => {
            setSelecionado({
                tipo: 'local',
                nome: 'Ponto escolhido no mapa',
                lat: evento.latlng.lat,
                lng: evento.latlng.lng,
            })
        })

        // o Leaflet precisa recalcular o tamanho quando o layout muda
        // (ex.: girar o celular, painel lateral quebrando pra baixo)
        const observador = new ResizeObserver(() => mapa.invalidateSize())
        observador.observe(elementoMapaRef.current)

        return () => {
            observador.disconnect()
            mapa.remove()
            mapaRef.current = null
            camadaPontosRef.current = null
        }
    }, [])

    // redesenha pinos e raio sempre que filtros, selecao ou raio mudam
    useEffect(() => {
        const camada = camadaPontosRef.current
        if (!camada) return

        camada.clearLayers()
        const idsProximos = new Set(proximos.map((ponto) => ponto.id))

        if (selecionado) {
            L.circle([selecionado.lat, selecionado.lng], {
                radius: raioKm * 1000,
                color: '#4ade80',
                weight: 1.5,
                fillColor: '#4ade80',
                fillOpacity: 0.07,
                interactive: false,
            }).addTo(camada)

            if (selecionado.tipo === 'local') {
                L.marker([selecionado.lat, selecionado.lng], {
                    icon: criarIcone('local', false, true),
                    keyboard: false,
                    interactive: false,
                }).addTo(camada)
            }
        }

        // o ponto selecionado continua no mapa mesmo se o filtro o esconderia
        const pontosNoMapa = todosPontos.filter(
            (ponto) => pontosVisiveis.includes(ponto) || ponto.id === selecionado?.id
        )

        pontosNoMapa.forEach((ponto) => {
            const resumo = ponto.tipo === 'produtor'
                ? `${ponto.produto} · ${ponto.quantidade}`
                : `Compra: ${ponto.interesses.join(', ')}`

            L.marker([ponto.lat, ponto.lng], {
                icon: criarIcone(ponto.tipo, idsProximos.has(ponto.id), ponto.id === selecionado?.id),
                title: ponto.nome,
            })
                .bindTooltip(`<strong>${ponto.nome}</strong><br>${resumo}`, { direction: 'top', offset: [0, -10] })
                .on('click', () => setSelecionado(ponto))
                .addTo(camada)
        })
    }, [pontosVisiveis, proximos, selecionado, raioKm])

    // busca o clima do ponto selecionado na Open-Meteo; o AbortController
    // cancela a requisicao anterior se o usuario trocar de ponto rapido
    useEffect(() => {
        if (!selecionado) return

        const controle = new AbortController()

        buscarClima(selecionado.lat, selecionado.lng, controle.signal)
            .then((dados) => setClimaRecebido({ ponto: selecionado, status: 'ok', dados }))
            .catch((erro) => {
                if (erro.name !== 'AbortError') setClimaRecebido({ ponto: selecionado, status: 'erro', dados: null })
            })

        return () => controle.abort()
    }, [selecionado])

    // seleciona um local avulso e enquadra o mapa no raio inteiro
    function selecionarLocal(nome, lat, lng) {
        setSelecionado({ tipo: 'local', nome, lat, lng })
        enquadrar(lat, lng)
    }

    function enquadrar(lat, lng) {
        const limites = L.latLng(lat, lng).toBounds(raioKm * 2000)
        mapaRef.current?.flyToBounds(limites, { padding: [20, 20], duration: 0.8 })
    }

    async function aoBuscarLocal(evento) {
        evento.preventDefault()
        const texto = textoBusca.trim()
        if (!texto) return

        setStatusBusca({ tipo: 'carregando', mensagem: `Buscando "${texto}"...` })
        try {
            const local = await buscarLocal(texto)
            if (!local) {
                setStatusBusca({ tipo: 'erro', mensagem: `Não encontramos "${texto}". Tente o nome da cidade e o estado.` })
                return
            }
            setStatusBusca({ tipo: null, mensagem: '' })
            selecionarLocal(local.nome, local.lat, local.lng)
        } catch {
            setStatusBusca({ tipo: 'erro', mensagem: 'Não foi possível buscar agora. Tente novamente em instantes.' })
        }
    }

    function aoUsarMinhaLocalizacao() {
        if (!('geolocation' in navigator)) {
            setStatusBusca({ tipo: 'erro', mensagem: 'Seu navegador não permite geolocalização.' })
            return
        }

        setStatusBusca({ tipo: 'carregando', mensagem: 'Obtendo sua localização...' })
        navigator.geolocation.getCurrentPosition(
            (posicao) => {
                setStatusBusca({ tipo: null, mensagem: '' })
                selecionarLocal('Sua localização', posicao.coords.latitude, posicao.coords.longitude)
            },
            () => {
                setStatusBusca({ tipo: 'erro', mensagem: 'Não foi possível obter sua localização. Verifique a permissão do navegador.' })
            },
            { timeout: 10000 }
        )
    }

    function aoEscolherProximo(ponto) {
        const original = todosPontos.find((p) => p.id === ponto.id)
        setSelecionado(original)
        enquadrar(original.lat, original.lng)
    }

    // enquanto a resposta do ponto atual nao chega, o clima esta "carregando"
    let clima = { status: 'ocioso', dados: null }
    if (selecionado) {
        clima = climaRecebido.ponto === selecionado ? climaRecebido : { status: 'carregando', dados: null }
    }

    const tituloProximos = selecionado?.tipo === 'comprador'
        ? `Ofertas num raio de ${raioKm} km`
        : `Compradores interessados num raio de ${raioKm} km`

    return (
        <section id="secao-mapa">
            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Mapa Interativo</p>
                <h2>Ofertas, compradores e clima na sua região</h2>
                <p>Clique num pino ou em qualquer lugar do mapa para ver a área de venda e a previsão do tempo</p>
            </div>

            <div className="barra-mapa anima-scroll">
                <form className="busca-mapa" onSubmit={aoBuscarLocal} role="search">
                    <label htmlFor="busca-local" className="sr-only">Buscar cidade</label>
                    <input
                        id="busca-local"
                        type="search"
                        placeholder="Buscar cidade (ex: Campinas, SP)"
                        value={textoBusca}
                        onChange={(e) => setTextoBusca(e.target.value)}
                        className="input-mapa"
                    />
                    <button type="submit" className="botao-mapa" disabled={statusBusca.tipo === 'carregando'}>
                        Buscar
                    </button>
                    <button type="button" className="botao-mapa botao-secundario" onClick={aoUsarMinhaLocalizacao}>
                        📍 Perto de mim
                    </button>
                </form>

                <div className="filtros-mapa">
                    <div className="grupo-filtro-tipo" role="group" aria-label="Filtrar por tipo">
                        {filtrosTipo.map((filtro) => (
                            <button
                                key={filtro.valor}
                                type="button"
                                className={`chip-filtro ${filtroTipo === filtro.valor ? 'ativo' : ''}`}
                                aria-pressed={filtroTipo === filtro.valor}
                                onClick={() => setFiltroTipo(filtro.valor)}
                            >
                                {filtro.rotulo}
                            </button>
                        ))}
                    </div>

                    <label className="campo-filtro">
                        Produto
                        <select
                            value={filtroProduto}
                            onChange={(e) => setFiltroProduto(e.target.value)}
                            className="input-mapa"
                        >
                            <option value="todos">Todos</option>
                            {produtosDisponiveis.map((produto) => (
                                <option key={produto} value={produto}>{produto}</option>
                            ))}
                        </select>
                    </label>

                    <label className="campo-filtro campo-raio">
                        Raio da área de venda: <strong>{raioKm} km</strong>
                        <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={raioKm}
                            onChange={(e) => setRaioKm(Number(e.target.value))}
                        />
                    </label>
                </div>

                {statusBusca.mensagem && (
                    <p className={`status-busca ${statusBusca.tipo === 'erro' ? 'status-erro' : ''}`} role="status">
                        {statusBusca.mensagem}
                    </p>
                )}
            </div>

            <div className="container-mapa anima-scroll">
                <div className="moldura-mapa">
                    <div
                        ref={elementoMapaRef}
                        className="mapa-leaflet"
                        role="region"
                        aria-label="Mapa de produtores e compradores"
                    />
                    <ul className="legenda-mapa">
                        <li><span className="pino-mapa pino-produtor" aria-hidden="true"></span>Produtor (oferta)</li>
                        <li><span className="pino-mapa pino-comprador" aria-hidden="true"></span>Comprador</li>
                        <li><span className="pino-mapa pino-comprador pino-destacado" aria-hidden="true"></span>Dentro do raio</li>
                        <li><span className="pino-mapa pino-local" aria-hidden="true"></span>Local escolhido</li>
                    </ul>
                </div>

                <aside className={`painel-mapa ${selecionado ? 'ativo' : 'inativo'}`} aria-live="polite">
                    {selecionado ? (
                        <>
                            <p className={`etiqueta-tipo etiqueta-${selecionado.tipo}`}>{rotulosTipo[selecionado.tipo]}</p>
                            <h3>{selecionado.nome}</h3>
                            <p className="local-ponto">
                                {selecionado.cidade ?? `${selecionado.lat.toFixed(4)}, ${selecionado.lng.toFixed(4)}`}
                            </p>

                            {selecionado.tipo === 'produtor' && (
                                <p className="detalhe-ponto">
                                    <strong>{selecionado.produto}</strong> · {selecionado.quantidade} · {selecionado.preco}
                                </p>
                            )}
                            {selecionado.tipo === 'comprador' && (
                                <p className="detalhe-ponto">
                                    <strong>Compra:</strong> {selecionado.interesses.join(', ')}
                                </p>
                            )}

                            <div className="bloco-painel">
                                <h4 className="subtitulo-painel">Clima no local</h4>
                                <ResumoClima clima={clima} />
                            </div>

                            <div className="bloco-painel">
                                <h4 className="subtitulo-painel">{tituloProximos}</h4>
                                {proximos.length ? (
                                    <ul className="lista-proximos">
                                        {proximos.map((ponto) => (
                                            <li key={ponto.id}>
                                                <button type="button" onClick={() => aoEscolherProximo(ponto)}>
                                                    <span className="nome-proximo">{ponto.nome}</span>
                                                    <span className="distancia-proximo">{formatarKm(ponto.distancia)}</span>
                                                    <span className="info-proximo">
                                                        {ponto.tipo === 'produtor'
                                                            ? `${ponto.produto} · ${ponto.preco}`
                                                            : ponto.cidade}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="sem-proximos">Ninguém por aqui ainda. Aumente o raio para alcançar mais gente.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="mapa-vazio">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <p>Selecione um ponto no mapa, busque uma cidade ou use sua localização</p>
                        </div>
                    )}
                </aside>
            </div>

            <p className="nota-mapa">
                Pontos ilustrativos (protótipo). Mapa: OpenStreetMap via Leaflet · Busca: Nominatim · Clima: Open-Meteo.
            </p>
        </section>
    )
}

export default MapaInterativo
