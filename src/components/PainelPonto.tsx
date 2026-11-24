'use client'

import { useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCiclo } from '@/context/CicloContext'
import { useLoja } from '@/context/LojaContext'
import { buscarPonto } from '@/data/catalogo'
import { ROTULO_STATUS, ROTULO_TIPO_PONTO } from '@/data/rotulos'
import useAgora from '@/hooks/useAgora'
import { statusExibido } from '@/lib/pedidos'
import { moeda, TAXAS } from '@/lib/taxas'

// Painel do ponto de retirada: o "QR duplo" do pagamento retido.
// QR 1 = caixa recebida da rota (prova a entrega do produtor)
// QR 2 = consumidor retirou (comeca o prazo de reclamacao)
// Aqui a leitura do QR e simulada digitando/colando o codigo.
export default function PainelPonto() {
    const { usuario } = useAuth()
    const { fase } = useCiclo()
    const { pedidos, registrarRecebimento, registrarRetirada, encerrarRetirada } = useLoja()
    const agora = useAgora()

    const [codigo, setCodigo] = useState('')
    const [retorno, setRetorno] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

    const ponto = buscarPonto(usuario?.pontoId ?? '')
    if (!ponto) {
        return <div className="pagina-app"><div className="estado">Ponto não encontrado. Entre novamente.</div></div>
    }

    const doPonto = pedidos.filter((p) => p.pontoId === ponto.id)
    const aguardandoRota = doPonto.filter((p) => p.status === 'pago')
    const naPrateleira = doPonto.filter((p) => p.status === 'no-ponto')
    const retirados = doPonto.filter((p) => !['pago', 'no-ponto', 'nao-retirado'].includes(p.status))
    const doados = doPonto.filter((p) => p.status === 'nao-retirado')
    const cicloAberto = fase === 'aberto'

    function executar(acao: 'recebimento' | 'retirada', codigoAlvo = codigo) {
        if (!ponto) return
        if (cicloAberto) {
            setRetorno({ tipo: 'erro', texto: 'Os pedidos ainda estão abertos (até qua 20h). As caixas chegam no sábado pela rota.' })
            return
        }
        const erro = acao === 'recebimento' ? registrarRecebimento(codigoAlvo, ponto.id) : registrarRetirada(codigoAlvo, ponto.id)
        if (erro) {
            setRetorno({ tipo: 'erro', texto: erro })
            return
        }
        setRetorno({
            tipo: 'ok',
            texto:
                acao === 'recebimento'
                    ? `QR 1 ✓ ${codigoAlvo.toUpperCase()} recebido. A entrega do produtor está comprovada.`
                    : `QR 2 ✓ ${codigoAlvo.toUpperCase()} retirado. Prazo de reclamação do consumidor iniciado.`,
        })
        setCodigo('')
    }

    function aoEnviar(e: FormEvent<HTMLFormElement>, acao: 'recebimento' | 'retirada') {
        e.preventDefault()
        if (codigo.trim()) executar(acao)
    }

    function encerrar() {
        if (!ponto) return
        if (!window.confirm('Encerrar a retirada de hoje? Pedidos não retirados viram doação (o produtor recebe normalmente).')) return
        const total = encerrarRetirada(ponto.id)
        setRetorno({ tipo: 'ok', texto: `${total} pedido(s) não retirado(s) encaminhado(s) para doação.` })
    }

    return (
        <div className="pagina-app">
            <header className="cabecalho-pagina">
                <p className="texto-fraco texto-pequeno">Painel do ponto de retirada · {ROTULO_TIPO_PONTO[ponto.tipo]}</p>
                <h1>{ponto.nome}</h1>
                <p>{ponto.endereco} · {ponto.bairro} · retirada aos sábados, 9h–13h</p>
            </header>

            <div className="numeros">
                <div className="numero amber"><span>Aguardando a rota</span><b>{aguardandoRota.length}</b></div>
                <div className="numero"><span>Na prateleira</span><b>{naPrateleira.length}</b></div>
                <div className="numero verde"><span>Retirados</span><b>{retirados.length}</b></div>
                <div className="numero"><span>Doados</span><b>{doados.length}</b></div>
                <div className="numero verde"><span>Você recebe ({moeda(TAXAS.partePonto)}/pedido)</span><b>{moeda((retirados.length + doados.length) * TAXAS.partePonto)}</b></div>
            </div>

            <div className="grade-2">
                <div className="caixa">
                    <h2>Ler QR code do pedido</h2>
                    <p className="texto-fraco" style={{ marginBottom: 14 }}>
                        Aponte a câmera para o QR da etiqueta (caixa) ou do celular do cliente. Neste protótipo, digite o código.
                    </p>
                    <form onSubmit={(e) => aoEnviar(e, 'retirada')}>
                        <label className="campo">
                            Código do pedido
                            <input
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                                placeholder="AG-0000"
                                maxLength={7}
                                autoComplete="off"
                                style={{ fontSize: 20, letterSpacing: '0.1em', fontWeight: 700 }}
                            />
                        </label>
                        <div className="acoes">
                            <button type="button" className="btn btn-secundario" disabled={!codigo.trim()} onClick={() => executar('recebimento')}>
                                QR 1 · Registrar recebimento
                            </button>
                            <button type="submit" className="btn btn-primario" disabled={!codigo.trim()}>
                                QR 2 · Registrar retirada
                            </button>
                        </div>
                    </form>
                    {retorno && (
                        <p className={`aviso ${retorno.tipo === 'ok' ? 'aviso-ok' : 'aviso-alto'}`} role="status" style={{ marginTop: 16 }}>
                            {retorno.texto}
                        </p>
                    )}
                    {cicloAberto && (
                        <p className="aviso aviso-atencao" style={{ marginTop: 16 }}>
                            Os pedidos ainda estão abertos: as caixas chegam no sábado, das 9h às 13h. Para testar agora, escolha a fase de retirada no Modo demonstração, no rodapé.
                        </p>
                    )}
                </div>

                <aside className="caixa">
                    <h2>Fim do horário (13h)</h2>
                    <p className="texto-fraco" style={{ marginBottom: 14 }}>
                        Ao encerrar, as caixas que ficaram na prateleira viram doação. O produtor recebe normalmente, pois cumpriu a entrega
                        (QR 1).
                    </p>
                    <button type="button" className="btn btn-perigo btn-largo" disabled={!naPrateleira.length} onClick={encerrar}>
                        Encerrar retirada ({naPrateleira.length} na prateleira)
                    </button>
                </aside>
            </div>

            <div className="caixa tabela-rolagem" style={{ marginTop: 24 }}>
                <h2>Pedidos deste ponto</h2>
                {doPonto.length === 0 ? (
                    <p className="texto-fraco">Nenhum pedido para este ponto no ciclo.</p>
                ) : (
                    <table className="tabela">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Cliente</th>
                                <th>Itens</th>
                                <th>Situação</th>
                                <th><span className="sr-only">Ação</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {doPonto.map((p) => {
                                const status = statusExibido(p, fase, agora)
                                return (
                                    <tr key={p.id}>
                                        <td><strong>{p.codigo}</strong></td>
                                        <td>{p.consumidor.split(' ')[0]}</td>
                                        <td>{p.itens.length}</td>
                                        <td><span className={`status-pedido status-${status}`}>{ROTULO_STATUS[status]}</span></td>
                                        <td>
                                            {p.status === 'pago' && !cicloAberto && (
                                                <button type="button" className="btn btn-secundario btn-pequeno" onClick={() => executar('recebimento', p.codigo)}>QR 1</button>
                                            )}
                                            {p.status === 'no-ponto' && (
                                                <button type="button" className="btn btn-primario btn-pequeno" onClick={() => executar('retirada', p.codigo)}>QR 2</button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
