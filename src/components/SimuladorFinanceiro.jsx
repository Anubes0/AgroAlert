import { useState } from 'react'
import './SimuladorFinanceiro.css'

function SimuladorFinanceiro() {
    const [nomeProduto, setNomeProduto] = useState('')
    const [pesoProduto, setPesoProduto] = useState('')
    const [precoVenda, setPrecoVenda] = useState('')

    const PERCENTUAL_CUSTOS_GERAIS = 30
    const PERCENTUAL_COMISSAO = 2.5

    const calcularSimulacao = () => {
        const preco = parseFloat(precoVenda) || 0

        const custosGerais = (preco * PERCENTUAL_CUSTOS_GERAIS) / 100
        const comissaoPlataforma = (preco * PERCENTUAL_COMISSAO) / 100
        const totalDescontos = custosGerais + comissaoPlataforma

        const lucroFinal = preco - totalDescontos

        return {
            preco: preco,
            custosGerais: custosGerais,
            comissaoPlataforma: comissaoPlataforma,
            totalDescontos: totalDescontos,
            lucroFinal: lucroFinal,
            margemLucro: preco > 0 ? ((lucroFinal / preco) * 100).toFixed(1) : 0,
        }
    }

    const simulacao = calcularSimulacao()

    const temDados = nomeProduto.trim() !== '' && pesoProduto && precoVenda

    return (
        <section id="secao-simulador-financeiro">
            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Simulação Interativa</p>
                <h2>Simulador de Impacto Financeiro</h2>
                <p>Veja quanto você ganha ao vender através da AgroAlert</p>
            </div>

            <div className="container-simulador">
                <div className="painel-entrada">
                    <h3>Inserir Dados do Produto</h3>
                    <p className="descricao-painel">
                        Preencha os campos abaixo para simular o impacto financeiro da venda
                    </p>

                    <div className="grupo-inputs">
                        <div className="campo-entrada">
                            <label htmlFor="nome-produto">
                                Nome do Produto
                                <span className="obrigatorio">*</span>
                            </label>
                            <input
                                id="nome-produto"
                                type="text"
                                placeholder="Ex: Tomate"
                                value={nomeProduto}
                                onChange={(e) => setNomeProduto(e.target.value)}
                                className="input-simulador"
                            />
                            <p className="dica-campo">
                                Identifique o produto que deseja simular
                            </p>
                        </div>

                        <div className="campo-entrada">
                            <label htmlFor="peso-produto">
                                Peso do Produto (kg)
                                <span className="obrigatorio">*</span>
                            </label>
                            <input
                                id="peso-produto"
                                type="number"
                                placeholder="Ex: 50"
                                value={pesoProduto}
                                onChange={(e) => setPesoProduto(e.target.value)}
                                className="input-simulador"
                                min="0"
                                step="0.1"
                            />
                            <p className="dica-campo">
                                Peso total do produto em quilogramas
                            </p>
                        </div>

                        {/* Input: Preço de Venda */}
                        <div className="campo-entrada">
                            <label htmlFor="preco-venda">
                                Preço de Venda (R$)
                                <span className="obrigatorio">*</span>
                            </label>
                            <input
                                id="preco-venda"
                                type="number"
                                placeholder="Ex: 500"
                                value={precoVenda}
                                onChange={(e) => setPrecoVenda(e.target.value)}
                                className="input-simulador"
                                min="0"
                                step="0.01"
                            />
                            <p className="dica-campo">
                                Valor total que você quer faturar com essa venda
                            </p>
                        </div>
                    </div>
                </div>

                {/* Painel de resultado da simulação */}
                <div className={`painel-resultado ${temDados ? 'ativo' : 'inativo'}`}>
                    {temDados ? (
                        <>
                            {/* Título com nome do produto */}
                            <h3>Simulação: {nomeProduto}</h3>
                            <p className="descricao-resultado">
                                {pesoProduto} kg • Preço de Venda: R$ {precoVenda}
                            </p>

                            {/* Fluxo de cálculo visual */}
                            <div className="fluxo-calculo">
                                {/* Preço de Venda */}
                                <div className="etapa-fluxo">
                                    <div className="label-etapa">Preço de Venda</div>
                                    <div className="valor-etapa valor-entrada">
                                        R$ {simulacao.preco.toFixed(2).replace('.', ',')}
                                    </div>
                                </div>

                                <div className="seta-fluxo">↓</div>

                                <div className="etapa-fluxo">
                                    <div className="label-etapa">
                                        Custos Gerais ({PERCENTUAL_CUSTOS_GERAIS}%)
                                    </div>
                                    <div className="valor-etapa valor-desconto">
                                        - R$ {simulacao.custosGerais.toFixed(2).replace('.', ',')}
                                    </div>
                                </div>

                                <div className="seta-fluxo">↓</div>

                                <div className="etapa-fluxo">
                                    <div className="label-etapa">
                                        Comissão AgroAlert ({PERCENTUAL_COMISSAO}%)
                                    </div>
                                    <div className="valor-etapa valor-desconto">
                                        - R$ {simulacao.comissaoPlataforma.toFixed(2).replace('.', ',')}
                                    </div>
                                </div>

                                <div className="seta-fluxo">↓</div>

                                <div className="etapa-fluxo etapa-final">
                                    <div className="label-etapa">Seu Lucro Líquido</div>
                                    <div className="valor-etapa valor-lucro">
                                        R$ {simulacao.lucroFinal.toFixed(2).replace('.', ',')}
                                    </div>
                                    <div className="margem-lucro">
                                        Margem: {simulacao.margemLucro}%
                                    </div>
                                </div>
                            </div>

                            <div className="resumo-financeiro">
                                <div className="cartao-resumo">
                                    <span className="label-cartao">Total Descontos</span>
                                    <span className="valor-cartao valor-desconto">
                                        R$ {simulacao.totalDescontos.toFixed(2).replace('.', ',')}
                                    </span>
                                </div>
                                <div className="cartao-resumo destaque">
                                    <span className="label-cartao">Lucro Líquido</span>
                                    <span className="valor-cartao valor-lucro">
                                        R$ {simulacao.lucroFinal.toFixed(2).replace('.', ',')}
                                    </span>
                                </div>
                            </div>

                            <div className="dica-resultado">
                                <p>
                                    💡 <strong>Dica:</strong> Ao usar a AgroAlert, você elimina
                                    intermediários e reduz custos operacionais, maximizando seu lucro!
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="mensagem-vazia">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                            <p>Preencha os dados acima para ver a simulação</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Seção explicativa sobre o modelo */}
            <div className="secao-explicacao">
                <h3>Como Funciona o Modelo</h3>
                <div className="grade-explicacao">
                    <div className="item-explicacao">
                        <div className="numero-item">1</div>
                        <h4>Custos Gerais (30%)</h4>
                        <p>
                            Inclui logística, embalagem, infraestrutura e demais despesas operacionais
                            necessárias para processar e entregar seu produto.
                        </p>
                    </div>
                    <div className="item-explicacao">
                        <div className="numero-item">2</div>
                        <h4>Comissão AgroAlert (2,5%)</h4>
                        <p>
                            Nossa taxa pela plataforma, tecnologia e suporte. É a menor do mercado,
                            garantindo máximo lucro para você.
                        </p>
                    </div>
                    <div className="item-explicacao">
                        <div className="numero-item">3</div>
                        <h4>Seu Lucro (67,5%)</h4>
                        <p>
                            Tudo o que sobra após os descontos é seu! Sem intermediários, você recebe
                            muito mais pelo seu produto.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SimuladorFinanceiro
