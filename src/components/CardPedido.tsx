'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useCiclo } from '@/context/CicloContext'
import { useLoja } from '@/context/LojaContext'
import { buscarPonto, buscarProdutor } from '@/data/catalogo'
import { ROTULO_STATUS } from '@/data/rotulos'
import { prazoReclamacaoHoras } from '@/lib/ciclo'
import {
    calcularValores,
    formatarQuantidade,
    itemDentroDoPrazo,
    prazoFinalReclamacao,
    statusExibido,
} from '@/lib/pedidos'
import { moeda } from '@/lib/taxas'
import type { Pedido, StatusExibido } from '@/types'

// trilha "feliz" do pedido, para a barra de progresso
const TRILHA: StatusExibido[] = ['pago', 'em-colheita', 'no-ponto', 'retirado', 'confirmado']

const formatarHora = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })

export default function CardPedido({ pedido, agora, destaque }: { pedido: Pedido; agora: Date; destaque?: boolean }) {
    const { fase, faseManual } = useCiclo()
    const { confirmarRecebimento, abrirReclamacao, simularHoras } = useLoja()
    const [reclamando, setReclamando] = useState(false)
    const [textoReclamacao, setTextoReclamacao] = useState('')

    const status = statusExibido(pedido, fase, agora)
    const valores = calcularValores(pedido)
    const ponto = buscarPonto(pedido.pontoId)
    const prazoFinal = prazoFinalReclamacao(pedido)
    const itensNoPrazo = pedido.itens.filter((i) => itemDentroDoPrazo(pedido, i, agora))

    const indiceAtual = TRILHA.indexOf(status === 'nao-retirado' ? 'no-ponto' : status === 'em-reclamacao' ? 'retirado' : status)
    const horasRestantes = prazoFinal ? Math.max(0, Math.ceil((prazoFinal.getTime() - agora.getTime()) / 3_600_000)) : 0

    function enviarReclamacao() {
        if (textoReclamacao.trim().length < 10) return
        abrirReclamacao(pedido.id, textoReclamacao.trim())
        setReclamando(false)
    }

    return (
        <article className="card-pedido" style={destaque ? { borderColor: 'var(--cor-verde)' } : undefined}>
            <div>
                <div className="cabecalho-pedido">
                    <span className="codigo-pedido">{pedido.codigo}</span>
                    <span className={`status-pedido status-${status}`}>{ROTULO_STATUS[status]}</span>
                    {pedido.assinatura && <span className="etiqueta selo-certificado">↻ Assinatura semanal</span>}
                </div>
                <p className="texto-fraco texto-pequeno">
                    Retirada: <strong>{ponto?.nome}</strong> · {ponto?.endereco} · sábado 9h–13h
                </p>

                <ol className="passos-pedido" aria-label="Andamento do pedido">
                    {TRILHA.map((etapa, i) => (
                        <li key={etapa} className={i < indiceAtual ? 'feito' : i === indiceAtual ? 'atual' : ''}>
                            {ROTULO_STATUS[etapa].split(' · ')[0]}
                        </li>
                    ))}
                </ol>

                <table className="tabela">
                    <tbody>
                        {pedido.itens.map((item) => (
                            <tr key={item.ofertaId}>
                                <td>
                                    {item.produto}
                                    <div className="texto-fraco texto-pequeno">
                                        {buscarProdutor(item.produtorId)?.sitio} · reclamação em até {prazoReclamacaoHoras(item.categoria)}h
                                    </div>
                                </td>
                                <td>
                                    {formatarQuantidade(item.quantidade, item.unidade)}
                                    {item.faltante > 0 && (
                                        <div className="texto-pequeno destaque-amber">faltou {formatarQuantidade(item.faltante, item.unidade)} · estornado</div>
                                    )}
                                </td>
                                <td className="num">{moeda(item.precoUnit * item.quantidade)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="resumo-valores" style={{ marginTop: 12 }}>
                    {valores.desconto > 0 && <div className="negativo"><span>Desconto assinatura</span><span>− {moeda(valores.desconto)}</span></div>}
                    {valores.estorno > 0 && <div className="negativo"><span>Estorno por falta na colheita</span><span>− {moeda(valores.estorno)}</span></div>}
                    <div><span>Taxa de retirada</span><span>{moeda(valores.taxaRetirada)}</span></div>
                    <div className="total"><span>Total cobrado</span><span>{moeda(valores.total)}</span></div>
                </div>

                {status === 'retirado' && (
                    <div className="aviso aviso-ok" style={{ marginTop: 16 }}>
                        Recebeu tudo certo? Confirme para liberar o pagamento ao produtor. Sem reclamação, a confirmação é
                        automática em <strong>{horasRestantes}h</strong>.
                        <div className="acoes">
                            <button type="button" className="btn btn-primario btn-pequeno" onClick={() => confirmarRecebimento(pedido.id)}>
                                ✓ Confirmar recebimento
                            </button>
                            {itensNoPrazo.length > 0 && (
                                <button type="button" className="btn btn-perigo btn-pequeno" onClick={() => setReclamando((r) => !r)}>
                                    Abrir reclamação
                                </button>
                            )}
                            {faseManual && (
                                <button type="button" className="btn btn-secundario btn-pequeno" onClick={() => simularHoras(pedido.id, 24)}>
                                    ⏩ Simular +24h
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {reclamando && status === 'retirado' && (
                    <div className="campo" style={{ marginTop: 14 }}>
                        <label htmlFor={`reclamacao-${pedido.id}`}>
                            O que aconteceu? Itens ainda no prazo: {itensNoPrazo.map((i) => i.produto).join(', ')}
                        </label>
                        <textarea
                            id={`reclamacao-${pedido.id}`}
                            value={textoReclamacao}
                            onChange={(e) => setTextoReclamacao(e.target.value)}
                            placeholder="Ex.: a alface veio murcha (mínimo 10 caracteres)"
                        />
                        <div className="acoes">
                            <button type="button" className="btn btn-perigo btn-pequeno" disabled={textoReclamacao.trim().length < 10} onClick={enviarReclamacao}>
                                Enviar reclamação (bloqueia o repasse)
                            </button>
                        </div>
                    </div>
                )}

                {status === 'em-reclamacao' && (
                    <p className="aviso aviso-alto" style={{ marginTop: 16 }}>
                        Reclamação registrada: &quot;{pedido.reclamacao}&quot;. O repasse ao produtor está bloqueado até a análise da associação.
                    </p>
                )}
                {status === 'nao-retirado' && (
                    <p className="aviso aviso-atencao" style={{ marginTop: 16 }}>
                        O pedido não foi retirado até 13h e foi doado. O produtor recebeu normalmente, conforme a regra aceita na compra.
                    </p>
                )}

                <ul className="historico">
                    {pedido.historico.map((h, i) => (
                        <li key={i}>
                            <time dateTime={h.em}>{formatarHora(h.em)}</time>
                            {h.detalhe ?? h.status}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="qr-box">
                <QRCodeSVG value={pedido.codigo} size={150} />
                <p>{pedido.codigo}</p>
                <small>Mostre no ponto de retirada</small>
            </div>
        </article>
    )
}
