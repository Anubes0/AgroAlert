'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '@/context/AuthContext'
import { useCiclo } from '@/context/CicloContext'
import { useLoja } from '@/context/LojaContext'
import { buscarProdutor, pontos } from '@/data/catalogo'
import { ROTULO_TIPO_PONTO } from '@/data/rotulos'
import { calcularRepasse, moeda, TAXAS } from '@/lib/taxas'
import FaixaCiclo from '@/components/FaixaCiclo'
import SeletorQuantidade, { passoDa } from '@/components/SeletorQuantidade'

export default function CestaPagina() {
    const router = useRouter()
    const { usuario } = useAuth()
    const { fase } = useCiclo()
    const { cesta, ofertas, disponivel, alterarQuantidade, removerDaCesta, pontoPreferido, escolherPonto, criarPedido, pronto } = useLoja()

    const [assinatura, setAssinatura] = useState(false)
    const [aceite, setAceite] = useState(false)
    const [pixAberto, setPixAberto] = useState(false)
    const [tentouPagar, setTentouPagar] = useState(false)

    // junta cada item da cesta com a oferta correspondente (descarta removidas)
    const linhas = cesta
        .map((item) => ({ item, oferta: ofertas.find((o) => o.id === item.ofertaId) }))
        .filter((l): l is { item: typeof l.item; oferta: NonNullable<typeof l.oferta> } => Boolean(l.oferta))

    const subtotal = linhas.reduce((s, l) => s + l.item.quantidade * l.oferta.preco, 0)
    const desconto = assinatura ? subtotal * TAXAS.descontoAssinatura : 0
    const total = subtotal - desconto + (linhas.length ? TAXAS.taxaRetirada : 0)
    const paraProdutores = calcularRepasse(subtotal - desconto).produtor

    const ehConsumidor = usuario?.perfil === 'consumidor'
    const erros: string[] = []
    if (!pontoPreferido) erros.push('Escolha o ponto de retirada.')
    if (!aceite) erros.push('Aceite a regra de retirada para continuar.')

    function pagar() {
        setTentouPagar(true)
        if (erros.length) return
        setPixAberto(true)
    }

    function confirmarPix() {
        if (!usuario || !pontoPreferido) return
        const pedido = criarPedido({ consumidor: usuario.nome, pontoId: pontoPreferido, assinatura })
        setPixAberto(false)
        if (pedido) router.push(`/pedidos?novo=${pedido.codigo}`)
    }

    if (!pronto) {
        return <div className="pagina-app"><div className="estado">Carregando sua cesta...</div></div>
    }

    return (
        <div className="pagina-app">
            <header className="cabecalho-pagina">
                <h1>Sua cesta</h1>
                <p>Revise os itens, escolha onde retirar no sábado e pague via Pix — o valor fica retido até você retirar.</p>
            </header>

            <FaixaCiclo />

            {linhas.length === 0 ? (
                <div className="estado">
                    <p>Sua cesta está vazia.</p>
                    <Link className="btn btn-primario" href="/ofertas">Ver ofertas da semana</Link>
                </div>
            ) : (
                <div className="grade-2">
                    <div className="pilha">
                        <div className="caixa">
                            <h2>Itens</h2>
                            <div className="tabela-rolagem">
                                <table className="tabela">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th>Quantidade</th>
                                            <th className="num">Valor</th>
                                            <th><span className="sr-only">Remover</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {linhas.map(({ item, oferta }) => (
                                            <tr key={item.ofertaId}>
                                                <td>
                                                    <Link className="link-verde" href={`/ofertas/${oferta.id}`}>{oferta.produto}</Link>
                                                    <div className="texto-fraco texto-pequeno">
                                                        {buscarProdutor(oferta.produtorId)?.sitio} · {moeda(oferta.preco)}/{oferta.unidade}
                                                        {oferta.classe === 'feio-mas-bom' && ' · feio mas bom'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <SeletorQuantidade
                                                        valor={item.quantidade}
                                                        unidade={oferta.unidade}
                                                        maximo={disponivel(oferta.id)}
                                                        minimo={passoDa(oferta.unidade)}
                                                        aoMudar={(q) => alterarQuantidade(oferta.id, q)}
                                                    />
                                                </td>
                                                <td className="num">{moeda(item.quantidade * oferta.preco)}</td>
                                                <td>
                                                    <button type="button" className="btn btn-perigo btn-pequeno" onClick={() => removerDaCesta(oferta.id)} aria-label={`Remover ${oferta.produto}`}>
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="caixa">
                            <h2>Ponto de retirada · sábado 9h–13h</h2>
                            <label className="campo">
                                Onde você vai retirar
                                <select value={pontoPreferido ?? ''} onChange={(e) => escolherPonto(e.target.value)}>
                                    <option value="" disabled>Selecione...</option>
                                    {pontos.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nome} — {p.bairro} ({ROTULO_TIPO_PONTO[p.tipo]})
                                        </option>
                                    ))}
                                </select>
                                <span className="dica-campo">
                                    {pontoPreferido
                                        ? pontos.find((p) => p.id === pontoPreferido)?.endereco
                                        : 'Não sabe qual é o mais perto? '}
                                    {!pontoPreferido && <Link className="link-verde" href="/mapa">Escolher no mapa</Link>}
                                </span>
                            </label>
                        </div>
                    </div>

                    <aside className="caixa">
                        <h2>Resumo</h2>

                        <label className="linha-check" style={{ marginBottom: 16 }}>
                            <input type="checkbox" checked={assinatura} onChange={(e) => setAssinatura(e.target.checked)} />
                            <span>
                                <strong className="destaque-verde">Repetir esta cesta toda semana</strong> e ganhar{' '}
                                {Math.round(TAXAS.descontoAssinatura * 100)}% de desconto. Cancele quando quiser.
                            </span>
                        </label>

                        <div className="resumo-valores">
                            <div><span>Produtos</span><span>{moeda(subtotal)}</span></div>
                            {assinatura && <div className="negativo"><span>Desconto assinatura</span><span>− {moeda(desconto)}</span></div>}
                            <div><span>Taxa de retirada (frete + ponto)</span><span>{moeda(TAXAS.taxaRetirada)}</span></div>
                            <div className="total"><span>Total</span><span>{moeda(total)}</span></div>
                        </div>
                        <p className="texto-fraco texto-pequeno" style={{ marginTop: 10 }}>
                            {moeda(paraProdutores)} vão direto para os produtores (85% dos produtos).
                        </p>

                        <label className="linha-check" style={{ margin: '18px 0' }}>
                            <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
                            <span>
                                Entendo que, se eu <strong>não retirar até 13h de sábado</strong>, o pedido é doado e não há
                                reembolso (o produtor já colheu e entregou).
                            </span>
                        </label>

                        {tentouPagar && erros.length > 0 && (
                            <ul className="aviso aviso-alto" role="alert" style={{ listStyle: 'none', marginBottom: 14 }}>
                                {erros.map((e) => <li key={e}>{e}</li>)}
                            </ul>
                        )}

                        {fase !== 'aberto' ? (
                            <p className="aviso aviso-atencao">O ciclo desta semana já fechou. Sua cesta fica salva para segunda.</p>
                        ) : ehConsumidor ? (
                            <button type="button" className="btn btn-primario btn-largo" onClick={pagar}>
                                Pagar {moeda(total)} com Pix
                            </button>
                        ) : (
                            <Link className="btn btn-primario btn-largo" href="/entrar?perfil=consumidor&volta=/cesta">
                                Entrar como consumidor para pagar
                            </Link>
                        )}
                    </aside>
                </div>
            )}

            {pixAberto && (
                <div className="fundo-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-pix" onClick={() => setPixAberto(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 id="titulo-pix">Pagamento via Pix</h2>
                        <p className="texto-fraco">Pagamento <strong>simulado</strong> (protótipo). Num sistema real, o intermediador com custódia geraria este QR.</p>
                        <div className="qr-box">
                            <QRCodeSVG value={`PIX-SIMULADO|AgroAlert|${pontoPreferido}|${total.toFixed(2)}`} size={170} />
                            <p>{moeda(total)}</p>
                            <small>Valor retido até a retirada</small>
                        </div>
                        <div className="acoes" style={{ justifyContent: 'center' }}>
                            <button type="button" className="btn btn-secundario" onClick={() => setPixAberto(false)}>Cancelar</button>
                            <button type="button" className="btn btn-primario" onClick={confirmarPix}>Simular pagamento confirmado ✓</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
