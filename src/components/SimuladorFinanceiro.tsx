'use client'

import { useState } from 'react'
import { calcularRepasse, moeda, TAXAS } from '@/lib/taxas'
import './SimuladorFinanceiro.css'

// Fase 7: o simulador da Fase 5/6 ("30% custos + 2,5% comissao") virou um
// COMPARADOR de renda entre os tres caminhos do produtor (Parte 3 do modelo):
// atravessador x vender por conta propria x AgroAlert.

interface Cenario {
    chave: 'atravessador' | 'sozinho' | 'agroalert'
    titulo: string
    valor: number
    detalhe: string
}

function numero(texto: string): number {
    const valor = parseFloat(texto.replace(',', '.'))
    return Number.isFinite(valor) && valor > 0 ? valor : 0
}

export default function SimuladorFinanceiro() {
    const [produto, setProduto] = useState('Tomate italiano')
    const [quantidade, setQuantidade] = useState('40')
    const [precoVenda, setPrecoVenda] = useState('14')
    const [precoAtravessador, setPrecoAtravessador] = useState('5')
    const [clientes, setClientes] = useState('15')
    const [custoEntrega, setCustoEntrega] = useState('12')

    const qtd = numero(quantidade)
    const preco = numero(precoVenda)
    const temDados = produto.trim() !== '' && qtd > 0 && preco > 0

    const bruto = qtd * preco
    const repasse = calcularRepasse(bruto)
    const custoSozinho = numero(clientes) * numero(custoEntrega)

    const cenarios: Cenario[] = [
        {
            chave: 'atravessador',
            titulo: 'Atravessador',
            valor: qtd * numero(precoAtravessador),
            detalhe: `${moeda(numero(precoAtravessador))}/kg pago na porteira`,
        },
        {
            chave: 'sozinho',
            titulo: 'Por conta própria',
            valor: bruto - custoSozinho,
            detalhe: `${clientes || 0} entregas × ${moeda(numero(custoEntrega))} + risco de calote`,
        },
        {
            chave: 'agroalert',
            titulo: 'AgroAlert',
            valor: repasse.produtor,
            detalhe: `85% do valor, pagamento garantido, 1 entrega no hub`,
        },
    ]

    const melhor = cenarios.reduce((a, b) => (b.valor > a.valor ? b : a))
    const ganhoSobreAtravessador = repasse.produtor - cenarios[0].valor

    return (
        <section id="secao-simulador-financeiro">
            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Simulação Interativa</p>
                <h2>Comparador de renda do produtor</h2>
                <p>Atravessador, venda por conta própria ou AgroAlert: quanto sobra no seu bolso?</p>
            </div>

            <div className="container-simulador">
                <div className="painel-entrada">
                    <h3>Dados da colheita</h3>
                    <p className="descricao-painel">Altere os valores e o resultado atualiza na hora</p>

                    <div className="grupo-inputs">
                        <div className="campo-entrada">
                            <label htmlFor="sim-produto">Produto <span className="obrigatorio">*</span></label>
                            <input id="sim-produto" className="input-simulador" value={produto} onChange={(e) => setProduto(e.target.value)} />
                        </div>
                        <div className="campo-entrada">
                            <label htmlFor="sim-qtd">Quantidade vendida na semana (kg) <span className="obrigatorio">*</span></label>
                            <input id="sim-qtd" type="number" min="0" step="0.5" className="input-simulador" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
                        </div>
                        <div className="campo-entrada">
                            <label htmlFor="sim-preco">Seu preço no AgroAlert (R$/kg) <span className="obrigatorio">*</span></label>
                            <input id="sim-preco" type="number" min="0" step="0.1" className="input-simulador" value={precoVenda} onChange={(e) => setPrecoVenda(e.target.value)} />
                            <p className="dica-campo">Mesmo preço que você cobraria vendendo direto ao consumidor</p>
                        </div>
                        <div className="campo-entrada">
                            <label htmlFor="sim-atravessador">Quanto o atravessador paga (R$/kg)</label>
                            <input id="sim-atravessador" type="number" min="0" step="0.1" className="input-simulador" value={precoAtravessador} onChange={(e) => setPrecoAtravessador(e.target.value)} />
                        </div>
                        <div className="campo-entrada">
                            <label htmlFor="sim-clientes">Vendendo sozinho: nº de entregas e custo de cada (R$)</label>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <input id="sim-clientes" type="number" min="0" className="input-simulador" value={clientes} onChange={(e) => setClientes(e.target.value)} aria-label="Número de entregas" />
                                <input type="number" min="0" step="0.5" className="input-simulador" value={custoEntrega} onChange={(e) => setCustoEntrega(e.target.value)} aria-label="Custo por entrega" />
                            </div>
                            <p className="dica-campo">Combustível + tempo de ir a cada cliente</p>
                        </div>
                    </div>
                </div>

                <div className={`painel-resultado ${temDados ? 'ativo' : 'inativo'}`} aria-live="polite">
                    {temDados ? (
                        <>
                            <h3>Simulação: {produto}</h3>
                            <p className="descricao-resultado">
                                {qtd.toString().replace('.', ',')} kg × {moeda(preco)} = {moeda(bruto)} vendidos pelo AgroAlert
                            </p>

                            <div className="fluxo-calculo">
                                <div className="etapa-fluxo">
                                    <div className="label-etapa">Valor dos produtos</div>
                                    <div className="valor-etapa valor-entrada">{moeda(repasse.bruto)}</div>
                                </div>
                                <div className="seta-fluxo">↓</div>
                                <div className="etapa-fluxo">
                                    <div className="label-etapa">Comissão AgroAlert ({Math.round(TAXAS.agroalert * 100)}%)</div>
                                    <div className="valor-etapa valor-desconto">- {moeda(repasse.agroalert)}</div>
                                </div>
                                <div className="seta-fluxo">↓</div>
                                <div className="etapa-fluxo">
                                    <div className="label-etapa">Associação / hub ({Math.round(TAXAS.associacao * 100)}%)</div>
                                    <div className="valor-etapa valor-desconto">- {moeda(repasse.associacao)}</div>
                                </div>
                                <div className="seta-fluxo">↓</div>
                                <div className="etapa-fluxo etapa-final">
                                    <div className="label-etapa">Você recebe (liberado após a retirada confirmada)</div>
                                    <div className="valor-etapa valor-lucro">{moeda(repasse.produtor)}</div>
                                    <div className="margem-lucro">
                                        {ganhoSobreAtravessador > 0
                                            ? `+${moeda(ganhoSobreAtravessador)} em relação ao atravessador`
                                            : 'O atravessador pagaria mais neste cenário'}
                                    </div>
                                </div>
                            </div>

                            <div className="resumo-financeiro comparativo">
                                {cenarios.map((c) => (
                                    <div className={`cartao-resumo ${c.chave === melhor.chave ? 'destaque' : ''}`} key={c.chave}>
                                        <span className="label-cartao">{c.titulo}</span>
                                        <span className={`valor-cartao ${c.valor >= 0 ? 'valor-lucro' : 'valor-desconto'}`}>{moeda(c.valor)}</span>
                                        <span className="detalhe-cartao">{c.detalhe}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="dica-resultado">
                                <p>
                                    💡 <strong>E se eu vender por conta própria?</strong> Sozinho você economiza os 15%, mas paga cada
                                    entrega, cobra cada cliente e corre o risco de calote. No AgroAlert é uma entrega só no hub e o
                                    pagamento já está garantido.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="mensagem-vazia">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                            <p>Preencha produto, quantidade e preço para comparar</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="secao-explicacao">
                <h3>Para onde vai cada real</h3>
                <div className="grade-explicacao">
                    <div className="item-explicacao">
                        <div className="numero-item">85%</div>
                        <h4>Produtor</h4>
                        <p>Sem mensalidade: o produtor só paga quando vende, e recebe assim que o comprador retira e confirma.</p>
                    </div>
                    <div className="item-explicacao">
                        <div className="numero-item">12%</div>
                        <h4>AgroAlert</h4>
                        <p>Plataforma, pagamento protegido (Pix com custódia), avisos e coordenação do ciclo semanal.</p>
                    </div>
                    <div className="item-explicacao">
                        <div className="numero-item">3%</div>
                        <h4>Associação</h4>
                        <p>Hub rural: conferência de qualidade, nota fiscal, cadastro assistido e montagem da rota.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
