'use client'

import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { useState } from 'react'
import { useLoja } from '@/context/LojaContext'
import { useCiclo } from '@/context/CicloContext'
import { buscarAssociacao, buscarProdutor } from '@/data/catalogo'
import { ROTULO_CATEGORIA, ROTULO_CLASSE, SELOS } from '@/data/rotulos'
import { prazoReclamacaoHoras } from '@/lib/ciclo'
import { formatarQuantidade } from '@/lib/pedidos'
import { calcularRepasse, moeda } from '@/lib/taxas'
import EtiquetasOferta from '@/components/EtiquetasOferta'
import CardOferta from '@/components/CardOferta'
import SeletorQuantidade, { passoDa } from '@/components/SeletorQuantidade'

// rota dinamica /ofertas/[id]: o segmento [id] da pasta vira um parametro
// lido com useParams() (Client Component, pois depende da cesta no Context)
export default function DetalheOferta() {
    const { id } = useParams<{ id: string }>()
    const { ofertas, statusOfertas, disponivel, adicionarNaCesta, cesta } = useLoja()
    const { fase } = useCiclo()
    const [quantidade, setQuantidade] = useState<number | null>(null)
    const [adicionado, setAdicionado] = useState(false)

    if (statusOfertas === 'carregando') {
        return (
            <div className="pagina-app">
                <div className="esqueleto" style={{ height: 320 }} />
            </div>
        )
    }

    const oferta = ofertas.find((o) => o.id === id)
    if (statusOfertas === 'ok' && !oferta) notFound()
    if (!oferta) {
        return (
            <div className="pagina-app">
                <div className="estado estado-erro">Não foi possível carregar esta oferta.</div>
            </div>
        )
    }

    const produtor = buscarProdutor(oferta.produtorId)
    const associacao = produtor ? buscarAssociacao(produtor.associacaoId) : undefined
    const passo = passoDa(oferta.unidade)
    const naCesta = cesta.find((i) => i.ofertaId === oferta.id)?.quantidade ?? 0
    const restante = disponivel(oferta.id) - naCesta
    const qtd = quantidade ?? Math.min(passo, restante)
    const prazo = prazoReclamacaoHoras(oferta.categoria)
    const podeAdicionar = fase === 'aberto' && restante >= passo && qtd > 0
    const outras = ofertas.filter((o) => o.produtorId === oferta.produtorId && o.id !== oferta.id)

    function adicionar() {
        if (!oferta) return
        adicionarNaCesta(oferta.id, qtd)
        setQuantidade(null)
        setAdicionado(true)
    }

    return (
        <div className="pagina-app">
            <Link className="trilha" href="/ofertas">← Voltar às ofertas</Link>

            <div className="grade-2">
                <div className="pilha">
                    <div className="caixa">
                        {produtor && <EtiquetasOferta oferta={oferta} selo={produtor.selo} />}
                        <h1 style={{ margin: '14px 0 6px', fontFamily: 'Fraunces, serif', fontSize: '2.2rem', color: '#fff' }}>
                            {oferta.produto}
                        </h1>
                        <p className="texto-fraco">
                            {ROTULO_CATEGORIA[oferta.categoria]} · {ROTULO_CLASSE[oferta.classe]} ·{' '}
                            {oferta.colheita === 'antecipada' ? 'colheita antecipada' : 'colheita da semana'}
                        </p>
                        <p className="texto-fraco" style={{ marginTop: 14 }}>{oferta.descricao}</p>

                        <p className="preco-oferta" style={{ marginTop: 18 }}>
                            {moeda(oferta.preco)} <small>/ {oferta.unidade}</small>
                        </p>
                        <p className={`disponivel ${restante < passo ? 'esgotado' : ''}`}>
                            {restante >= passo ? `${formatarQuantidade(restante, oferta.unidade)} ainda disponíveis neste ciclo` : 'Esgotado neste ciclo'}
                        </p>

                        <div className="acoes" style={{ alignItems: 'center' }}>
                            <SeletorQuantidade valor={qtd} unidade={oferta.unidade} minimo={passo} maximo={restante} aoMudar={setQuantidade} />
                            <button type="button" className="btn btn-primario" disabled={!podeAdicionar} onClick={adicionar}>
                                Adicionar {moeda(qtd * oferta.preco)} à cesta
                            </button>
                            {adicionado && <Link className="btn btn-secundario" href="/cesta">Ir para a cesta →</Link>}
                        </div>
                        {fase !== 'aberto' && <p className="aviso aviso-atencao" style={{ marginTop: 14 }}>O ciclo desta semana já fechou. Novas encomendas a partir de segunda.</p>}
                    </div>

                    <div className="caixa">
                        <h3>Como funciona a compra</h3>
                        <ul className="texto-fraco" style={{ paddingLeft: 18, display: 'grid', gap: 6 }}>
                            <li>Você paga agora via Pix e o valor fica <strong>retido</strong> até a retirada.</li>
                            <li>Se faltar produto na colheita, o valor do item é <strong>estornado</strong> automaticamente.</li>
                            <li>Depois de retirar, você tem <strong>{prazo}h</strong> para reclamar deste item ({prazo === 24 ? 'folhosas e ervas murcham rápido' : 'frutas, legumes e raízes'}).</li>
                            <li>Do valor do produto, {moeda(calcularRepasse(oferta.preco).produtor)} por {oferta.unidade} vão direto para o produtor (85%).</li>
                        </ul>
                    </div>
                </div>

                {produtor && (
                    <aside className="caixa">
                        <p className="texto-fraco texto-pequeno">Quem produz</p>
                        <h2 style={{ marginTop: 4 }}>{produtor.sitio}</h2>
                        <p className="texto-fraco">{produtor.nome} · {produtor.cidade}</p>

                        <div className="numeros" style={{ marginTop: 16 }}>
                            <div className="numero verde">
                                <span>Taxa de cumprimento</span>
                                <b>{Math.round(produtor.taxaCumprimento * 100)}%</b>
                            </div>
                            <div className="numero">
                                <span>No AgroAlert desde</span>
                                <b>{produtor.desde}</b>
                            </div>
                        </div>

                        <p className="texto-fraco"><strong className="destaque-verde">{SELOS[produtor.selo].rotulo}:</strong> {SELOS[produtor.selo].descricao}</p>
                        {associacao && (
                            <p className="texto-fraco" style={{ marginTop: 10 }}>
                                Entrega pelo hub <strong>{associacao.nome}</strong> ({associacao.cidade}).
                            </p>
                        )}
                        <div className="acoes">
                            <Link className="btn btn-secundario btn-pequeno" href={`/ofertas?produtor=${produtor.id}`}>Todas as ofertas do sítio</Link>
                            <Link className="btn btn-secundario btn-pequeno" href="/mapa">Ver no mapa</Link>
                        </div>
                    </aside>
                )}
            </div>

            {outras.length > 0 && (
                <section style={{ marginTop: 40 }}>
                    <h2 style={{ fontFamily: 'Fraunces, serif', color: '#fff', marginBottom: 16 }}>Mais do {produtor?.sitio}</h2>
                    <div className="grade-ofertas">
                        {outras.map((o) => <CardOferta key={o.id} oferta={o} />)}
                    </div>
                </section>
            )}
        </div>
    )
}
