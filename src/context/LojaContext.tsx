'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import usePersistente from '@/hooks/usePersistente'
import { CONSUMIDOR_DEMO } from '@/data/catalogo'
import { formatarQuantidade, gerarCodigo, gerarId } from '@/lib/pedidos'
import { TAXAS } from '@/lib/taxas'
import type { ItemCesta, ItemPedido, Oferta, Pedido, StatusPedido } from '@/types'

// Estado global da "loja": ofertas (vindas da API + alteracoes do produtor),
// cesta do consumidor e pedidos. Tudo persiste no localStorage, simulando o
// banco de dados que existiria num back-end real.

type StatusCarga = 'carregando' | 'ok' | 'erro'

// alteracoes locais sobre as ofertas da API: o produtor pode criar, editar
// (sobrescreve pelo mesmo id) e remover
interface AlteracoesOfertas {
    salvas: Oferta[]
    removidas: string[]
}

export interface DadosPedidoNovo {
    consumidor: string
    pontoId: string
    assinatura: boolean
}

interface LojaValor {
    // ofertas
    ofertas: Oferta[]
    statusOfertas: StatusCarga
    recarregarOfertas: () => void
    salvarOferta: (oferta: Oferta) => void
    removerOferta: (id: string) => void
    disponivel: (ofertaId: string) => number
    // cesta
    cesta: ItemCesta[]
    adicionarNaCesta: (ofertaId: string, quantidade: number) => void
    alterarQuantidade: (ofertaId: string, quantidade: number) => void
    removerDaCesta: (ofertaId: string) => void
    pontoPreferido: string | null
    escolherPonto: (pontoId: string) => void
    // pedidos
    pedidos: Pedido[]
    criarPedido: (dados: DadosPedidoNovo) => Pedido | null
    registrarRecebimento: (codigo: string, pontoId: string) => string | null
    registrarRetirada: (codigo: string, pontoId: string) => string | null
    confirmarRecebimento: (pedidoId: string) => void
    abrirReclamacao: (pedidoId: string, texto: string) => void
    marcarFalta: (pedidoId: string, ofertaId: string, quantidade: number) => void
    encerrarRetirada: (pontoId: string) => number
    simularHoras: (pedidoId: string, horas: number) => void
    pronto: boolean
}

const LojaContext = createContext<LojaValor | null>(null)

const agoraIso = () => new Date().toISOString()

// pedidos de exemplo: um da conta de demonstracao (Meus pedidos nao comeca
// vazio) e tres de outros consumidores, para o painel do produtor e do
// ponto ja terem romaneio
function pedidosDeExemplo(ofertas: Oferta[]): Pedido[] {
    const montarItem = (ofertaId: string, quantidade: number): ItemPedido | null => {
        const o = ofertas.find((of) => of.id === ofertaId)
        if (!o) return null
        return {
            ofertaId: o.id,
            produtorId: o.produtorId,
            produto: o.produto,
            categoria: o.categoria,
            unidade: o.unidade,
            precoUnit: o.preco,
            quantidade,
            faltante: 0,
        }
    }
    const exemplos: [string, string, string, [string, number][], boolean][] = [
        ['AG-1907', CONSUMIDOR_DEMO, 'r1', [['o3', 1], ['o6', 1], ['o9', 2], ['o16', 1]], false],
        ['AG-2741', 'Carla Souza', 'r1', [['o1', 2], ['o4', 1.5], ['o10', 1], ['o13', 1]], true],
        ['AG-5318', 'Rafael Tavares', 'r2', [['o3', 2], ['o5', 2], ['o8', 1], ['o12', 1]], false],
        ['AG-8064', 'Juliana Prado', 'r1', [['o2', 1], ['o7', 2], ['o11', 2], ['o17', 1]], false],
    ]
    return exemplos.map(([codigo, consumidor, pontoId, itens, assinatura]) => ({
        id: gerarId('ped'),
        codigo,
        consumidor,
        pontoId,
        itens: itens.map(([id, q]) => montarItem(id, q)).filter((i): i is ItemPedido => i !== null),
        assinatura,
        taxaRetirada: TAXAS.taxaRetirada,
        status: 'pago' as StatusPedido,
        historico: [{ status: 'pago', em: agoraIso(), detalhe: 'Pix confirmado · valor retido em custódia' }],
        criadoEm: agoraIso(),
    }))
}

export function LojaProvider({ children }: { children: ReactNode }) {
    const [ofertasApi, setOfertasApi] = useState<Oferta[]>([])
    const [statusOfertas, setStatusOfertas] = useState<StatusCarga>('carregando')
    const [tentativa, setTentativa] = useState(0)

    const [alteracoes, setAlteracoes, prontoAlteracoes] = usePersistente<AlteracoesOfertas>('ofertas-locais', {
        salvas: [],
        removidas: [],
    })
    const [cesta, setCesta, prontoCesta] = usePersistente<ItemCesta[]>('cesta', [])
    const [pontoPreferido, setPontoPreferido] = usePersistente<string | null>('ponto-preferido', null)
    const [pedidos, setPedidos, prontoPedidos] = usePersistente<Pedido[] | null>('pedidos', null)

    // useEffect + fetch: busca as ofertas da semana na API do proprio Next
    // (/api/ofertas). O AbortController cancela a requisicao se o componente
    // desmontar antes da resposta.
    useEffect(() => {
        const controle = new AbortController()

        fetch('/api/ofertas', { signal: controle.signal })
            .then((resposta) => {
                if (!resposta.ok) throw new Error(`API respondeu ${resposta.status}`)
                return resposta.json() as Promise<Oferta[]>
            })
            .then((dados) => {
                setOfertasApi(dados)
                setStatusOfertas('ok')
            })
            .catch((erro: Error) => {
                if (erro.name !== 'AbortError') setStatusOfertas('erro')
            })

        return () => controle.abort()
    }, [tentativa])

    // ofertas efetivas = API, menos as removidas, com as edicoes por cima
    const ofertas = useMemo(() => {
        const idsSalvos = new Set(alteracoes.salvas.map((o) => o.id))
        const daApi = ofertasApi.filter((o) => !alteracoes.removidas.includes(o.id) && !idsSalvos.has(o.id))
        return [...daApi, ...alteracoes.salvas.filter((o) => !alteracoes.removidas.includes(o.id))]
    }, [ofertasApi, alteracoes])

    // primeira visita: cria pedidos de exemplo quando as ofertas chegarem
    useEffect(() => {
        if (prontoPedidos && pedidos === null && statusOfertas === 'ok') {
            setPedidos(pedidosDeExemplo(ofertasApi))
        }
    }, [prontoPedidos, pedidos, statusOfertas, ofertasApi, setPedidos])

    const listaPedidos = useMemo(() => pedidos ?? [], [pedidos])

    // quanto da oferta ainda pode ser vendido neste ciclo
    const disponivel = useCallback(
        (ofertaId: string) => {
            const oferta = ofertas.find((o) => o.id === ofertaId)
            if (!oferta) return 0
            const vendido = listaPedidos.reduce(
                (soma, p) => soma + p.itens.filter((i) => i.ofertaId === ofertaId).reduce((s, i) => s + i.quantidade, 0),
                0
            )
            return Math.max(0, oferta.quantidade - vendido)
        },
        [ofertas, listaPedidos]
    )

    // ---------- ofertas (painel do produtor) ----------
    const salvarOferta = useCallback(
        (oferta: Oferta) => {
            setAlteracoes((atual) => ({
                salvas: [...atual.salvas.filter((o) => o.id !== oferta.id), oferta],
                removidas: atual.removidas.filter((id) => id !== oferta.id),
            }))
        },
        [setAlteracoes]
    )

    const removerOferta = useCallback(
        (id: string) => {
            setAlteracoes((atual) => ({
                salvas: atual.salvas.filter((o) => o.id !== id),
                removidas: [...atual.removidas, id],
            }))
            setCesta((atual) => atual.filter((i) => i.ofertaId !== id))
        },
        [setAlteracoes, setCesta]
    )

    // ---------- cesta ----------
    const adicionarNaCesta = useCallback(
        (ofertaId: string, quantidade: number) => {
            setCesta((atual) => {
                const existente = atual.find((i) => i.ofertaId === ofertaId)
                if (existente) {
                    return atual.map((i) => (i.ofertaId === ofertaId ? { ...i, quantidade: i.quantidade + quantidade } : i))
                }
                return [...atual, { ofertaId, quantidade }]
            })
        },
        [setCesta]
    )

    const alterarQuantidade = useCallback(
        (ofertaId: string, quantidade: number) => {
            setCesta((atual) =>
                quantidade <= 0
                    ? atual.filter((i) => i.ofertaId !== ofertaId)
                    : atual.map((i) => (i.ofertaId === ofertaId ? { ...i, quantidade } : i))
            )
        },
        [setCesta]
    )

    const removerDaCesta = useCallback(
        (ofertaId: string) => setCesta((atual) => atual.filter((i) => i.ofertaId !== ofertaId)),
        [setCesta]
    )

    // ---------- pedidos ----------
    const atualizarPedido = useCallback(
        (filtro: (p: Pedido) => boolean, mudar: (p: Pedido) => Pedido) => {
            setPedidos((atual) => (atual ?? []).map((p) => (filtro(p) ? mudar(p) : p)))
        },
        [setPedidos]
    )

    const criarPedido = useCallback(
        ({ consumidor, pontoId, assinatura }: DadosPedidoNovo): Pedido | null => {
            const itens: ItemPedido[] = cesta
                .map((item) => {
                    const oferta = ofertas.find((o) => o.id === item.ofertaId)
                    if (!oferta) return null
                    return {
                        ofertaId: oferta.id,
                        produtorId: oferta.produtorId,
                        produto: oferta.produto,
                        categoria: oferta.categoria,
                        unidade: oferta.unidade,
                        precoUnit: oferta.preco,
                        quantidade: Math.min(item.quantidade, disponivel(oferta.id)),
                        faltante: 0,
                    }
                })
                .filter((i): i is ItemPedido => i !== null && i.quantidade > 0)

            if (!itens.length) return null

            const pedido: Pedido = {
                id: gerarId('ped'),
                codigo: gerarCodigo(listaPedidos.map((p) => p.codigo)),
                consumidor,
                pontoId,
                itens,
                assinatura,
                taxaRetirada: TAXAS.taxaRetirada,
                status: 'pago',
                historico: [{ status: 'pago', em: agoraIso(), detalhe: 'Pix confirmado · valor retido em custódia' }],
                criadoEm: agoraIso(),
            }
            setPedidos((atual) => [pedido, ...(atual ?? [])])
            setCesta([])
            return pedido
        },
        [cesta, ofertas, disponivel, listaPedidos, setPedidos, setCesta]
    )

    // 1º QR: o ponto recebe a caixa vinda da rota (prova da entrega do produtor)
    const registrarRecebimento = useCallback(
        (codigo: string, pontoId: string): string | null => {
            const pedido = listaPedidos.find((p) => p.codigo === codigo.trim().toUpperCase())
            if (!pedido) return 'Código não encontrado.'
            if (pedido.pontoId !== pontoId) return 'Este pedido é de outro ponto de retirada.'
            if (pedido.status !== 'pago') return 'Recebimento já registrado para este pedido.'
            atualizarPedido(
                (p) => p.id === pedido.id,
                (p) => ({
                    ...p,
                    status: 'no-ponto',
                    historico: [...p.historico, { status: 'no-ponto', em: agoraIso(), detalhe: 'QR 1 · caixa recebida no ponto' }],
                })
            )
            return null
        },
        [listaPedidos, atualizarPedido]
    )

    // 2º QR: o consumidor retira; comeca a contar o prazo de reclamacao
    const registrarRetirada = useCallback(
        (codigo: string, pontoId: string): string | null => {
            const pedido = listaPedidos.find((p) => p.codigo === codigo.trim().toUpperCase())
            if (!pedido) return 'Código não encontrado.'
            if (pedido.pontoId !== pontoId) return 'Este pedido é de outro ponto de retirada.'
            if (pedido.status === 'pago') return 'A caixa ainda não foi recebida neste ponto (registre o QR 1 antes).'
            if (pedido.status !== 'no-ponto') return 'Este pedido já foi retirado.'
            atualizarPedido(
                (p) => p.id === pedido.id,
                (p) => ({
                    ...p,
                    status: 'retirado',
                    retiradoEm: agoraIso(),
                    historico: [...p.historico, { status: 'retirado', em: agoraIso(), detalhe: 'QR 2 · retirado pelo consumidor' }],
                })
            )
            return null
        },
        [listaPedidos, atualizarPedido]
    )

    const confirmarRecebimento = useCallback(
        (pedidoId: string) =>
            atualizarPedido(
                (p) => p.id === pedidoId,
                (p) => ({
                    ...p,
                    status: 'confirmado',
                    historico: [...p.historico, { status: 'confirmado', em: agoraIso(), detalhe: 'Confirmado pelo consumidor · repasse liberado' }],
                })
            ),
        [atualizarPedido]
    )

    const abrirReclamacao = useCallback(
        (pedidoId: string, texto: string) =>
            atualizarPedido(
                (p) => p.id === pedidoId,
                (p) => ({
                    ...p,
                    status: 'em-reclamacao',
                    reclamacao: texto,
                    historico: [...p.historico, { status: 'em-reclamacao', em: agoraIso(), detalhe: 'Repasse bloqueado até a análise' }],
                })
            ),
        [atualizarPedido]
    )

    // falta na colheita: o item faltante nunca e repassado e volta ao consumidor
    const marcarFalta = useCallback(
        (pedidoId: string, ofertaId: string, quantidade: number) =>
            atualizarPedido(
                (p) => p.id === pedidoId,
                (p) => {
                    const item = p.itens.find((i) => i.ofertaId === ofertaId)
                    if (!item) return p
                    const faltante = Math.min(Math.max(0, quantidade), item.quantidade)
                    return {
                        ...p,
                        itens: p.itens.map((i) => (i.ofertaId === ofertaId ? { ...i, faltante } : i)),
                        historico: [
                            ...p.historico,
                            { status: 'estorno', em: agoraIso(), detalhe: `Falta na colheita: ${item.produto} (${formatarQuantidade(faltante, item.unidade)}) estornado` },
                        ],
                    }
                }
            ),
        [atualizarPedido]
    )

    // fim do horario de retirada: caixas nao retiradas viram doacao e o
    // produtor recebe (cumpriu a entrega no ponto)
    const encerrarRetirada = useCallback(
        (pontoId: string): number => {
            const alvo = listaPedidos.filter((p) => p.pontoId === pontoId && p.status === 'no-ponto')
            atualizarPedido(
                (p) => p.pontoId === pontoId && p.status === 'no-ponto',
                (p) => ({
                    ...p,
                    status: 'nao-retirado',
                    historico: [...p.historico, { status: 'nao-retirado', em: agoraIso(), detalhe: 'Não retirado até 13h · doado · repasse liberado ao produtor' }],
                })
            )
            return alvo.length
        },
        [listaPedidos, atualizarPedido]
    )

    // modo demonstracao: "volta" a hora da retirada para simular o tempo passando
    const simularHoras = useCallback(
        (pedidoId: string, horas: number) =>
            atualizarPedido(
                (p) => p.id === pedidoId && Boolean(p.retiradoEm),
                (p) => ({
                    ...p,
                    retiradoEm: new Date(new Date(p.retiradoEm as string).getTime() - horas * 3_600_000).toISOString(),
                })
            ),
        [atualizarPedido]
    )

    const valor: LojaValor = {
        ofertas,
        statusOfertas,
        recarregarOfertas: () => {
            setStatusOfertas('carregando')
            setTentativa((t) => t + 1)
        },
        salvarOferta,
        removerOferta,
        disponivel,
        cesta,
        adicionarNaCesta,
        alterarQuantidade,
        removerDaCesta,
        pontoPreferido,
        escolherPonto: setPontoPreferido,
        pedidos: listaPedidos,
        criarPedido,
        registrarRecebimento,
        registrarRetirada,
        confirmarRecebimento,
        abrirReclamacao,
        marcarFalta,
        encerrarRetirada,
        simularHoras,
        pronto: prontoAlteracoes && prontoCesta && prontoPedidos,
    }

    return <LojaContext.Provider value={valor}>{children}</LojaContext.Provider>
}

export function useLoja(): LojaValor {
    const valor = useContext(LojaContext)
    if (!valor) throw new Error('useLoja precisa estar dentro de <LojaProvider>')
    return valor
}
