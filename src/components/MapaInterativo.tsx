'use client'

// Mapa reaproveitado da Fase 6 (Leaflet + OpenStreetMap + Nominatim + Open-Meteo),
// agora mostrando o modelo v2: pontos de retirada, associacoes (hubs) e produtores.
// O Leaflet acessa "window", que nao existe no servidor: por isso a pagina /mapa
// importa este componente com next/dynamic e { ssr: false }.

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLoja } from '@/context/LojaContext'
import { ROTULO_TIPO_PONTO, SELOS } from '@/data/rotulos'
import {
    buscarClima,
    buscarLocal,
    calcularDistanciaKm,
    descreverTempo,
    formatarDia,
    formatarKm,
    gerarAlertas,
    type Clima,
} from '@/lib/clima'
import type { Associacao, PontoRetirada, Produtor } from '@/types'
import './MapaInterativo.css'

type TipoMarcador = 'ponto' | 'hub' | 'produtor' | 'local'

interface Marcador {
    id: string
    tipo: TipoMarcador
    nome: string
    subtitulo: string
    lat: number
    lng: number
}

interface DadosMapa {
    pontos: PontoRetirada[]
    associacoes: Associacao[]
    produtores: Produtor[]
}

interface Proximo extends Marcador {
    distancia: number
}

type EstadoClima =
    | { status: 'ocioso' | 'carregando' | 'erro'; dados: null }
    | { status: 'ok'; dados: Clima }

const CENTRO_INICIAL: L.LatLngTuple = [-23.58, -46.65]
const ZOOM_INICIAL = 9
const RAIO_PADRAO_KM = 10

const filtrosTipo: { valor: 'todos' | Exclude<TipoMarcador, 'local'>; rotulo: string }[] = [
    { valor: 'todos', rotulo: 'Todos' },
    { valor: 'ponto', rotulo: 'Pontos de retirada' },
    { valor: 'hub', rotulo: 'Associações (hubs)' },
    { valor: 'produtor', rotulo: 'Produtores' },
]

const rotulosTipo: Record<TipoMarcador, string> = {
    ponto: 'Ponto de retirada',
    hub: 'Associação · hub rural',
    produtor: 'Produtor',
    local: 'Local escolhido',
}

// camadas de fundo (todas gratuitas e sem chave de API)
function criarCamadasBase() {
    const urlOsm = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    const creditoOsm = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    return {
        Escuro: L.tileLayer(urlOsm, { attribution: creditoOsm, maxZoom: 19, className: 'camada-escura' }),
        Ruas: L.tileLayer(urlOsm, { attribution: creditoOsm, maxZoom: 19 }),
        Satélite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Imagens &copy; Esri',
            maxZoom: 19,
        }),
    }
}

// pino desenhado so com CSS (divIcon): nao depende das imagens padrao do Leaflet
function criarIcone(tipo: TipoMarcador, destacado: boolean, selecionado: boolean) {
    const classes = ['pino-mapa', `pino-${tipo}`]
    if (destacado) classes.push('pino-destacado')
    if (selecionado) classes.push('pino-selecionado')
    return L.divIcon({
        className: 'icone-pino',
        html: `<span class="${classes.join(' ')}"></span>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    })
}

function ResumoClima({ clima }: { clima: EstadoClima }) {
    if (clima.status === 'carregando') return <p className="clima-status">Consultando a previsão na Open-Meteo...</p>
    if (clima.status === 'erro') return <p className="clima-status clima-erro">Não foi possível carregar o clima agora.</p>
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
            <h4 className="subtitulo-painel">Alertas para a colheita</h4>
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

export default function MapaInterativo() {
    const router = useRouter()
    const { escolherPonto, pontoPreferido } = useLoja()

    const elementoMapaRef = useRef<HTMLDivElement>(null)
    const mapaRef = useRef<L.Map | null>(null)
    const camadaPontosRef = useRef<L.LayerGroup | null>(null)

    const [dados, setDados] = useState<DadosMapa | null>(null)
    const [erroDados, setErroDados] = useState(false)
    const [filtroTipo, setFiltroTipo] = useState<(typeof filtrosTipo)[number]['valor']>('todos')
    const [raioKm, setRaioKm] = useState(RAIO_PADRAO_KM)
    const [selecionado, setSelecionado] = useState<Marcador | null>(null)
    const [climaRecebido, setClimaRecebido] = useState<{ ponto: Marcador | null; estado: EstadoClima }>({
        ponto: null,
        estado: { status: 'ocioso', dados: null },
    })
    const [textoBusca, setTextoBusca] = useState('')
    const [statusBusca, setStatusBusca] = useState<{ tipo: 'carregando' | 'erro' | null; mensagem: string }>({ tipo: null, mensagem: '' })

    // useEffect + fetch: pontos, hubs e produtores vem da API do proprio Next
    useEffect(() => {
        const controle = new AbortController()
        fetch('/api/mapa', { signal: controle.signal })
            .then((r) => {
                if (!r.ok) throw new Error(String(r.status))
                return r.json() as Promise<DadosMapa>
            })
            .then(setDados)
            .catch((erro: Error) => {
                if (erro.name !== 'AbortError') setErroDados(true)
            })
        return () => controle.abort()
    }, [])

    const marcadores = useMemo<Marcador[]>(() => {
        if (!dados) return []
        return [
            ...dados.pontos.map((p) => ({ id: p.id, tipo: 'ponto' as const, nome: p.nome, subtitulo: `${p.bairro} · ${ROTULO_TIPO_PONTO[p.tipo]}`, lat: p.lat, lng: p.lng })),
            ...dados.associacoes.map((a) => ({ id: a.id, tipo: 'hub' as const, nome: a.nome, subtitulo: a.cidade, lat: a.lat, lng: a.lng })),
            ...dados.produtores.map((p) => ({ id: p.id, tipo: 'produtor' as const, nome: p.sitio, subtitulo: `${p.nome} · ${p.cidade}`, lat: p.lat, lng: p.lng })),
        ]
    }, [dados])

    const visiveis = useMemo(
        () => marcadores.filter((m) => filtroTipo === 'todos' || m.tipo === filtroTipo),
        [marcadores, filtroTipo]
    )

    // o que mostrar no painel, conforme o tipo selecionado:
    //  local    -> pontos de retirada dentro do raio
    //  ponto    -> associacoes que abastecem (distancia da rota)
    //  hub      -> produtores vinculados
    //  produtor -> a associacao (hub) dele
    const proximos = useMemo<Proximo[]>(() => {
        if (!selecionado || !dados) return []
        const comDistancia = (lista: Marcador[]) =>
            lista
                .map((m) => ({ ...m, distancia: calcularDistanciaKm(selecionado, m) }))
                .sort((a, b) => a.distancia - b.distancia)

        if (selecionado.tipo === 'local') {
            return comDistancia(marcadores.filter((m) => m.tipo === 'ponto')).filter((m) => m.distancia <= raioKm)
        }
        if (selecionado.tipo === 'ponto') return comDistancia(marcadores.filter((m) => m.tipo === 'hub'))
        if (selecionado.tipo === 'hub') {
            const ids = dados.produtores.filter((p) => p.associacaoId === selecionado.id).map((p) => p.id)
            return comDistancia(marcadores.filter((m) => m.tipo === 'produtor' && ids.includes(m.id)))
        }
        const produtor = dados.produtores.find((p) => p.id === selecionado.id)
        return comDistancia(marcadores.filter((m) => m.tipo === 'hub' && m.id === produtor?.associacaoId))
    }, [selecionado, dados, marcadores, raioKm])

    // cria o mapa uma unica vez (e destroi ao sair da pagina)
    useEffect(() => {
        if (!elementoMapaRef.current) return
        const mapa = L.map(elementoMapaRef.current, { center: CENTRO_INICIAL, zoom: ZOOM_INICIAL, scrollWheelZoom: false })
        const camadasBase = criarCamadasBase()
        camadasBase.Escuro.addTo(mapa)
        L.control.layers(camadasBase, undefined, { position: 'topright' }).addTo(mapa)
        camadaPontosRef.current = L.layerGroup().addTo(mapa)
        mapaRef.current = mapa

        mapa.on('focus', () => mapa.scrollWheelZoom.enable())
        mapa.on('blur', () => mapa.scrollWheelZoom.disable())
        mapa.on('click', (evento: L.LeafletMouseEvent) => {
            setSelecionado({ id: 'local', tipo: 'local', nome: 'Ponto escolhido no mapa', subtitulo: '', lat: evento.latlng.lat, lng: evento.latlng.lng })
        })

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
        const idsProximos = new Set(proximos.map((p) => `${p.tipo}-${p.id}`))

        if (selecionado?.tipo === 'local') {
            L.circle([selecionado.lat, selecionado.lng], {
                radius: raioKm * 1000,
                color: '#4ade80',
                weight: 1.5,
                fillColor: '#4ade80',
                fillOpacity: 0.07,
                interactive: false,
            }).addTo(camada)
            L.marker([selecionado.lat, selecionado.lng], { icon: criarIcone('local', false, true), keyboard: false, interactive: false }).addTo(camada)
        }

        // linhas da "rota" entre o selecionado e os relacionados (ponto<->hub, hub<->produtor)
        if (selecionado && selecionado.tipo !== 'local') {
            proximos.forEach((p) =>
                L.polyline(
                    [
                        [selecionado.lat, selecionado.lng],
                        [p.lat, p.lng],
                    ],
                    { color: '#fbbf24', weight: 1.5, dashArray: '6 6', interactive: false }
                ).addTo(camada)
            )
        }

        const ehSelecionado = (m: Marcador) => selecionado?.tipo === m.tipo && selecionado.id === m.id
        marcadores
            .filter((m) => visiveis.includes(m) || ehSelecionado(m))
            .forEach((m) => {
                L.marker([m.lat, m.lng], { icon: criarIcone(m.tipo, idsProximos.has(`${m.tipo}-${m.id}`), ehSelecionado(m)), title: m.nome })
                    .bindTooltip(`<strong>${m.nome}</strong><br>${m.subtitulo}`, { direction: 'top', offset: [0, -10] })
                    .on('click', () => setSelecionado(m))
                    .addTo(camada)
            })
    }, [marcadores, visiveis, proximos, selecionado, raioKm])

    // clima do ponto selecionado; o AbortController cancela a requisicao anterior
    useEffect(() => {
        if (!selecionado) return
        const controle = new AbortController()
        buscarClima(selecionado.lat, selecionado.lng, controle.signal)
            .then((clima) => setClimaRecebido({ ponto: selecionado, estado: { status: 'ok', dados: clima } }))
            .catch((erro: Error) => {
                if (erro.name !== 'AbortError') setClimaRecebido({ ponto: selecionado, estado: { status: 'erro', dados: null } })
            })
        return () => controle.abort()
    }, [selecionado])

    function enquadrar(lat: number, lng: number, km = raioKm) {
        mapaRef.current?.flyToBounds(L.latLng(lat, lng).toBounds(km * 2000), { padding: [20, 20], duration: 0.8 })
    }

    function selecionarLocal(nome: string, lat: number, lng: number) {
        setSelecionado({ id: 'local', tipo: 'local', nome, subtitulo: '', lat, lng })
        enquadrar(lat, lng)
    }

    async function aoBuscarLocal(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault()
        const texto = textoBusca.trim()
        if (!texto) return
        setStatusBusca({ tipo: 'carregando', mensagem: `Buscando "${texto}"...` })
        try {
            const local = await buscarLocal(texto)
            if (!local) {
                setStatusBusca({ tipo: 'erro', mensagem: `Não encontramos "${texto}". Tente o bairro e a cidade.` })
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
            () => setStatusBusca({ tipo: 'erro', mensagem: 'Não foi possível obter sua localização. Verifique a permissão do navegador.' }),
            { timeout: 10000 }
        )
    }

    function aoEscolherProximo(m: Marcador) {
        setSelecionado(m)
        enquadrar(m.lat, m.lng, 15)
    }

    function retirarAqui(pontoId: string) {
        escolherPonto(pontoId)
        router.push('/cesta')
    }

    const clima: EstadoClima = !selecionado
        ? { status: 'ocioso', dados: null }
        : climaRecebido.ponto === selecionado
          ? climaRecebido.estado
          : { status: 'carregando', dados: null }

    const tituloProximos: Record<TipoMarcador, string> = {
        local: `Pontos de retirada num raio de ${raioKm} km`,
        ponto: 'Associações que abastecem este ponto (rota)',
        hub: 'Produtores vinculados a este hub',
        produtor: 'Associação (hub) onde entrega as caixas',
    }

    const produtorSelecionado = selecionado?.tipo === 'produtor' ? dados?.produtores.find((p) => p.id === selecionado.id) : undefined

    return (
        <section id="secao-mapa">
            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Mapa Interativo</p>
                <h2>Pontos de retirada, hubs e produtores</h2>
                <p>Busque seu bairro para achar o ponto mais perto, ou clique num pino para ver a rota e o clima</p>
            </div>

            <div className="barra-mapa anima-scroll">
                <form className="busca-mapa" onSubmit={aoBuscarLocal} role="search">
                    <label htmlFor="busca-local" className="sr-only">Buscar bairro ou cidade</label>
                    <input
                        id="busca-local"
                        type="search"
                        placeholder="Buscar bairro ou cidade (ex: Pinheiros, São Paulo)"
                        value={textoBusca}
                        onChange={(e) => setTextoBusca(e.target.value)}
                        className="input-mapa"
                    />
                    <button type="submit" className="botao-mapa" disabled={statusBusca.tipo === 'carregando'}>Buscar</button>
                    <button type="button" className="botao-mapa botao-secundario" onClick={aoUsarMinhaLocalizacao}>📍 Perto de mim</button>
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
                    <label className="campo-filtro campo-raio">
                        Raio de busca de pontos: <strong>{raioKm} km</strong>
                        <input type="range" min="2" max="40" step="1" value={raioKm} onChange={(e) => setRaioKm(Number(e.target.value))} />
                    </label>
                </div>

                {statusBusca.mensagem && (
                    <p className={`status-busca ${statusBusca.tipo === 'erro' ? 'status-erro' : ''}`} role="status">{statusBusca.mensagem}</p>
                )}
                {erroDados && <p className="status-busca status-erro" role="alert">Não foi possível carregar os pontos do mapa.</p>}
            </div>

            <div className="container-mapa anima-scroll">
                <div className="moldura-mapa">
                    <div ref={elementoMapaRef} className="mapa-leaflet" role="region" aria-label="Mapa de pontos de retirada, associações e produtores" />
                    <ul className="legenda-mapa">
                        <li><span className="pino-mapa pino-ponto" aria-hidden="true"></span>Ponto de retirada</li>
                        <li><span className="pino-mapa pino-hub" aria-hidden="true"></span>Associação (hub)</li>
                        <li><span className="pino-mapa pino-produtor" aria-hidden="true"></span>Produtor</li>
                        <li><span className="pino-mapa pino-local" aria-hidden="true"></span>Local escolhido</li>
                    </ul>
                </div>

                <aside className={`painel-mapa ${selecionado ? 'ativo' : 'inativo'}`} aria-live="polite">
                    {selecionado ? (
                        <>
                            <p className={`etiqueta-tipo etiqueta-${selecionado.tipo}`}>{rotulosTipo[selecionado.tipo]}</p>
                            <h3>{selecionado.nome}</h3>
                            <p className="local-ponto">{selecionado.subtitulo || `${selecionado.lat.toFixed(4)}, ${selecionado.lng.toFixed(4)}`}</p>

                            {selecionado.tipo === 'ponto' && (
                                <div className="acao-painel-mapa">
                                    <p className="detalhe-ponto">Retirada aos sábados, 9h–13h</p>
                                    <button type="button" className="botao-mapa" onClick={() => retirarAqui(selecionado.id)}>
                                        {pontoPreferido === selecionado.id ? '✓ Meu ponto — ir para a cesta' : 'Retirar aqui →'}
                                    </button>
                                </div>
                            )}
                            {produtorSelecionado && (
                                <div className="acao-painel-mapa">
                                    <p className="detalhe-ponto">Selo: <strong>{SELOS[produtorSelecionado.selo].rotulo}</strong></p>
                                    <Link className="botao-mapa" href={`/ofertas?produtor=${produtorSelecionado.id}`}>Ver ofertas deste produtor</Link>
                                </div>
                            )}

                            <div className="bloco-painel">
                                <h4 className="subtitulo-painel">{tituloProximos[selecionado.tipo]}</h4>
                                {proximos.length ? (
                                    <ul className="lista-proximos">
                                        {proximos.map((m) => (
                                            <li key={`${m.tipo}-${m.id}`}>
                                                <button type="button" onClick={() => aoEscolherProximo(m)}>
                                                    <span className="nome-proximo">{m.nome}</span>
                                                    <span className="distancia-proximo">{formatarKm(m.distancia)}</span>
                                                    <span className="info-proximo">{m.subtitulo}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="sem-proximos">Nenhum ponto neste raio ainda. Aumente o raio ou indique um ponto parceiro!</p>
                                )}
                            </div>

                            <div className="bloco-painel">
                                <h4 className="subtitulo-painel">Clima no local</h4>
                                <ResumoClima clima={clima} />
                            </div>
                        </>
                    ) : (
                        <div className="mapa-vazio">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <p>Busque seu bairro, use sua localização ou clique num pino</p>
                        </div>
                    )}
                </aside>
            </div>

            <p className="nota-mapa">Dados fictícios do piloto. Mapa: OpenStreetMap via Leaflet · Busca: Nominatim · Clima: Open-Meteo.</p>
        </section>
    )
}
