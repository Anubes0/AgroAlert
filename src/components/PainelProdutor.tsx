'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCiclo } from '@/context/CicloContext'
import { useLoja } from '@/context/LojaContext'
import { buscarAssociacao, buscarPonto, buscarProdutor } from '@/data/catalogo'
import { ROTULO_CATEGORIA, ROTULO_STATUS } from '@/data/rotulos'
import useAgora from '@/hooks/useAgora'
import { ROTULO_FASE } from '@/lib/ciclo'
import type { AlertaClima } from '@/lib/clima'
import { formatarQuantidade, repasseLiberado, statusExibido } from '@/lib/pedidos'
import { calcularRepasse, moeda, TAXAS } from '@/lib/taxas'
import type { Oferta } from '@/types'
import AlertaClimaProdutor from './AlertaClimaProdutor'
import { SeloEtiqueta } from './EtiquetasOferta'
import FormOferta from './FormOferta'

type Aba = 'ofertas' | 'clima' | 'romaneio' | 'extrato'

const ABAS: { id: Aba; rotulo: string }[] = [
    { id: 'ofertas', rotulo: 'Ofertas da semana' },
    { id: 'clima', rotulo: 'Alerta de clima' },
    { id: 'romaneio', rotulo: 'Administração' },
    { id: 'extrato', rotulo: 'Extrato' },
]

// formulario aberto: nova oferta (com valores sugeridos) ou edicao
type EstadoForm = { modo: 'fechado' } | { modo: 'novo'; sugestao?: Partial<Oferta> } | { modo: 'editar'; oferta: Oferta }

export default function PainelProdutor() {
    const { usuario } = useAuth()
    const { fase } = useCiclo()
    const { ofertas, pedidos, disponivel, salvarOferta, removerOferta, marcarFalta } = useLoja()
    const agora = useAgora()

    const [aba, setAba] = useState<Aba>('ofertas')
    const [form, setForm] = useState<EstadoForm>({ modo: 'fechado' })
    const [faltas, setFaltas] = useState<Record<string, string>>({})
    const [mensagem, setMensagem] = useState('')
    // um aviso novo cancela o timer do anterior (antes o 1o timer apagava o 2o aviso)
    const timerAviso = useRef<ReturnType<typeof setTimeout> | null>(null)
    useEffect(() => () => {
        if (timerAviso.current) clearTimeout(timerAviso.current)
    }, [])

    const produtor = buscarProdutor(usuario?.produtorId ?? '')
    const minhasOfertas = useMemo(() => ofertas.filter((o) => o.produtorId === produtor?.id), [ofertas, produtor])

    // itens dos pedidos que sao deste produtor (romaneio e extrato)
    const meusItens = useMemo(
        () =>
            pedidos.flatMap((pedido) =>
                pedido.itens
                    .filter((i) => i.produtorId === produtor?.id)
                    .map((item) => ({ pedido, item, status: statusExibido(pedido, fase, agora) }))
            ),
        [pedidos, produtor, fase, agora]
    )

    if (!produtor) {
        return <div className="pagina-app"><div className="estado">Produtor não encontrado. Entre novamente.</div></div>
    }

    const associacao = buscarAssociacao(produtor.associacaoId)
    const vendidoDe = (ofertaId: string) => {
        const oferta = ofertas.find((o) => o.id === ofertaId)
        return oferta ? oferta.quantidade - disponivel(ofertaId) : 0
    }

    function avisar(texto: string) {
        if (timerAviso.current) clearTimeout(timerAviso.current)
        setMensagem(texto)
        timerAviso.current = setTimeout(() => setMensagem(''), 3500)
    }

    function aoSalvar(oferta: Oferta) {
        salvarOferta(oferta)
        setForm({ modo: 'fechado' })
        avisar(`Oferta "${oferta.produto}" salva e já visível na vitrine.`)
    }

    function aoRemover(oferta: Oferta) {
        if (vendidoDe(oferta.id) > 0) {
            avisar('Esta oferta já tem pedidos neste ciclo e não pode ser excluída. Reduza a quantidade ou registre a falta na aba Administração.')
            return
        }
        if (!window.confirm(`Excluir a oferta "${oferta.produto}"?`)) return
        removerOferta(oferta.id)
        avisar('Oferta excluída.')
    }

    // o alerta de clima leva o produtor direto para a acao no ciclo
    function aoAgirNoAlerta(acao: AlertaClima['acao']) {
        setAba('ofertas')
        if (acao === 'antecipar') {
            setForm({ modo: 'novo', sugestao: { colheita: 'antecipada', categoria: 'folhosas', descricao: 'Colheita antecipada por alerta de clima.' } })
        } else if (acao === 'reduzir') {
            avisar('Revise as quantidades: clique em "Editar" nas ofertas mais expostas ao clima.')
        } else {
            avisar('Manejo: cubra as folhosas, reforce estacas e escoe a água dos canteiros. Se houver perda, registre a falta na aba Administração.')
        }
    }

    // ---------- romaneio: agrupado por produto ----------
    const porProduto = new Map<string, { produto: string; unidade: string; total: number; linhas: typeof meusItens }>()
    meusItens.forEach((linha) => {
        const chave = linha.item.ofertaId
        const grupo = porProduto.get(chave) ?? { produto: linha.item.produto, unidade: linha.item.unidade, total: 0, linhas: [] }
        grupo.total += linha.item.quantidade - linha.item.faltante
        grupo.linhas.push(linha)
        porProduto.set(chave, grupo)
    })

    // ---------- extrato ----------
    const entregue = (l: (typeof meusItens)[number]) => l.item.precoUnit * (l.item.quantidade - l.item.faltante)
    const brutoTotal = meusItens.reduce((s, l) => s + entregue(l), 0)
    const liberado = meusItens.filter((l) => repasseLiberado(l.status)).reduce((s, l) => s + entregue(l), 0)
    const estornado = meusItens.reduce((s, l) => s + l.item.precoUnit * l.item.faltante, 0)
    const repasseTotal = calcularRepasse(brutoTotal)

    return (
        <div className="pagina-app">
            <header className="cabecalho-pagina">
                <p className="texto-fraco texto-pequeno">Painel do produtor · {ROTULO_FASE[fase]}</p>
                <h1>{produtor.sitio}</h1>
                <p>
                    {produtor.nome} · {produtor.cidade} · hub: {associacao?.nome}{' '}
                    <SeloEtiqueta selo={produtor.selo} longo />
                </p>
            </header>

            <div className="abas" role="tablist">
                {ABAS.map((a) => (
                    <button key={a.id} type="button" role="tab" aria-selected={aba === a.id} className={`aba ${aba === a.id ? 'ativa' : ''}`} onClick={() => setAba(a.id)}>
                        {a.rotulo}
                    </button>
                ))}
            </div>

            {mensagem && <p className="aviso aviso-ok" role="status" style={{ marginBottom: 16 }}>{mensagem}</p>}

            {aba === 'ofertas' && (
                <>
                    {fase !== 'aberto' && (
                        <p className="aviso aviso-atencao" style={{ marginBottom: 16 }}>
                            O ciclo está fechado: novas ofertas só aparecem para compra a partir de segunda.
                        </p>
                    )}

                    {form.modo === 'fechado' ? (
                        <button type="button" className="btn btn-primario" style={{ marginBottom: 20 }} onClick={() => setForm({ modo: 'novo' })}>
                            + Nova oferta
                        </button>
                    ) : (
                        <FormOferta
                            key={form.modo === 'editar' ? form.oferta.id : 'nova'}
                            produtorId={produtor.id}
                            inicial={form.modo === 'editar' ? form.oferta : form.sugestao}
                            vendido={form.modo === 'editar' ? vendidoDe(form.oferta.id) : 0}
                            aoSalvar={aoSalvar}
                            aoCancelar={() => setForm({ modo: 'fechado' })}
                        />
                    )}

                    {minhasOfertas.length ? (
                        <div className="caixa tabela-rolagem">
                            <table className="tabela">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Preço</th>
                                        <th>Prometido</th>
                                        <th>Vendido</th>
                                        <th>Disponível</th>
                                        <th><span className="sr-only">Ações</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {minhasOfertas.map((o) => (
                                        <tr key={o.id}>
                                            <td>
                                                <Link className="link-verde" href={`/ofertas/${o.id}`}>{o.produto}</Link>
                                                <div className="texto-fraco texto-pequeno">
                                                    {ROTULO_CATEGORIA[o.categoria]}
                                                    {o.classe === 'feio-mas-bom' && ' · feio mas bom'}
                                                    {o.colheita === 'antecipada' && ' · antecipada'}
                                                </div>
                                            </td>
                                            <td>{moeda(o.preco)}/{o.unidade}</td>
                                            <td>{formatarQuantidade(o.quantidade, o.unidade)}</td>
                                            <td>{formatarQuantidade(vendidoDe(o.id), o.unidade)}</td>
                                            <td>{formatarQuantidade(disponivel(o.id), o.unidade)}</td>
                                            <td>
                                                <div className="acoes" style={{ marginTop: 0, flexWrap: 'nowrap' }}>
                                                    <button type="button" className="btn btn-secundario btn-pequeno" onClick={() => setForm({ modo: 'editar', oferta: o })}>Editar</button>
                                                    <button type="button" className="btn btn-perigo btn-pequeno" onClick={() => aoRemover(o)}>Excluir</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="estado">Nenhuma oferta publicada nesta semana.</div>
                    )}
                </>
            )}

            {aba === 'clima' && <AlertaClimaProdutor produtor={produtor} aoAgir={aoAgirNoAlerta} />}

            {aba === 'romaneio' && (
                <>
                    <p className={`aviso ${fase === 'aberto' ? 'aviso-atencao' : 'aviso-ok'}`} style={{ marginBottom: 20 }}>
                        {fase === 'aberto'
                            ? 'Romaneio parcial: os pedidos ainda podem mudar até quarta às 20h. Colha só depois do fechamento.'
                            : 'Ciclo fechado: este é o romaneio final. Colha exatamente estas quantidades. Se faltar produto, registre a falta — o item é estornado ao consumidor.'}
                    </p>

                    {porProduto.size === 0 ? (
                        <div className="estado">Nenhum pedido com seus produtos neste ciclo ainda.</div>
                    ) : (
                        <div className="pilha">
                            {[...porProduto.entries()].map(([ofertaId, grupo]) => (
                                <div className="caixa tabela-rolagem" key={ofertaId}>
                                    <h3>
                                        {grupo.produto}: colher {formatarQuantidade(grupo.total, grupo.unidade)}
                                    </h3>
                                    <table className="tabela">
                                        <thead>
                                            <tr>
                                                <th>Pedido</th>
                                                <th>Consumidor</th>
                                                <th>Ponto</th>
                                                <th>Qtd.</th>
                                                <th>Falta na colheita</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {grupo.linhas.map(({ pedido, item, status }) => {
                                                const chave = `${pedido.id}-${item.ofertaId}`
                                                const podeMarcar = status === 'em-colheita'
                                                return (
                                                    <tr key={chave}>
                                                        <td>{pedido.codigo}<div className="texto-fraco texto-pequeno">{ROTULO_STATUS[status]}</div></td>
                                                        {/* so o primeiro nome: dados minimos (LGPD) */}
                                                        <td>{pedido.consumidor.split(' ')[0]}</td>
                                                        <td>{buscarPonto(pedido.pontoId)?.bairro}</td>
                                                        <td>{formatarQuantidade(item.quantidade, item.unidade)}</td>
                                                        <td>
                                                            {item.faltante > 0 ? (
                                                                <span className="destaque-amber">{formatarQuantidade(item.faltante, item.unidade)} estornado</span>
                                                            ) : podeMarcar ? (
                                                                <div className="acoes" style={{ marginTop: 0, flexWrap: 'nowrap' }}>
                                                                    <input
                                                                        aria-label="Quantidade que faltou"
                                                                        inputMode="decimal"
                                                                        placeholder="0"
                                                                        value={faltas[chave] ?? ''}
                                                                        onChange={(e) => setFaltas((f) => ({ ...f, [chave]: e.target.value }))}
                                                                        style={{ width: 60, background: 'var(--cor-fundo)', color: '#fff', border: '1px solid var(--cor-borda)', borderRadius: 6, padding: '5px 8px' }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-perigo btn-pequeno"
                                                                        onClick={() => {
                                                                            const qtd = parseFloat((faltas[chave] ?? '').replace(',', '.'))
                                                                            if (!(qtd > 0)) {
                                                                                avisar('Informe quanto faltou (um número maior que zero).')
                                                                                return
                                                                            }
                                                                            marcarFalta(pedido.id, item.ofertaId, qtd)
                                                                            avisar(
                                                                                qtd > item.quantidade
                                                                                    ? `Falta limitada a ${formatarQuantidade(item.quantidade, item.unidade)} (o total do pedido ${pedido.codigo}). Consumidor estornado.`
                                                                                    : `Falta registrada no pedido ${pedido.codigo}: o consumidor foi estornado.`
                                                                            )
                                                                        }}
                                                                    >
                                                                        Registrar falta
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="texto-fraco texto-pequeno">{fase === 'aberto' ? 'após o fechamento' : '—'}</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {aba === 'extrato' && (
                <>
                    <div className="numeros numeros-3">
                        <div className="numero"><span>Vendido no ciclo</span><b>{moeda(brutoTotal)}</b></div>
                        <div className="numero"><span>Comissão AgroAlert ({Math.round(TAXAS.agroalert * 100)}%)</span><b>− {moeda(repasseTotal.agroalert)}</b></div>
                        <div className="numero"><span>Associação ({Math.round(TAXAS.associacao * 100)}%)</span><b>− {moeda(repasseTotal.associacao)}</b></div>
                        <div className="numero verde"><span>Seu líquido (85%)</span><b>{moeda(repasseTotal.produtor)}</b></div>
                        <div className="numero verde"><span>Já liberado</span><b>{moeda(calcularRepasse(liberado).produtor)}</b></div>
                        <div className="numero amber"><span>Retido até a retirada</span><b>{moeda(calcularRepasse(brutoTotal - liberado).produtor)}</b></div>
                    </div>
                    {estornado > 0 && <p className="aviso aviso-atencao" style={{ marginBottom: 16 }}>{moeda(estornado)} em itens não colhidos foram estornados aos consumidores (não entram no repasse).</p>}

                    <div className="caixa tabela-rolagem">
                        <table className="tabela">
                            <thead>
                                <tr>
                                    <th>Pedido</th>
                                    <th>Item</th>
                                    <th>Situação</th>
                                    <th className="num">Bruto</th>
                                    <th className="num">Você recebe</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meusItens.map(({ pedido, item, status }) => {
                                    const valor = item.precoUnit * (item.quantidade - item.faltante)
                                    return (
                                        <tr key={`${pedido.id}-${item.ofertaId}`}>
                                            <td>{pedido.codigo}</td>
                                            <td>{item.produto} · {formatarQuantidade(item.quantidade - item.faltante, item.unidade)}</td>
                                            <td>
                                                <span className={repasseLiberado(status) ? 'destaque-verde' : 'destaque-amber'}>
                                                    {repasseLiberado(status) ? 'Liberado' : status === 'em-reclamacao' ? 'Bloqueado (reclamação)' : 'Retido'}
                                                </span>
                                            </td>
                                            <td className="num">{moeda(valor)}</td>
                                            <td className="num">{moeda(calcularRepasse(valor).produtor)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}
