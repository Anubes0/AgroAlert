// Unica fonte das taxas do modelo de negocio (Parte 3). Painel, cesta,
// planos e comparador leem daqui: mudar um percentual atualiza o site todo.
export const TAXAS = {
    agroalert: 0.12, // comissao da plataforma sobre os produtos
    associacao: 0.03, // hub: conferencia, nota fiscal, cadastro assistido
    taxaRetirada: 6, // R$ por pedido, paga pelo consumidor
    parteFrete: 4, // da taxa de retirada -> rota compartilhada
    partePonto: 2, // da taxa de retirada -> ponto parceiro
    descontoAssinatura: 0.05, // cesta semanal recorrente
    industria: 0.08, // lotes fora de padrao para processamento
} as const

export const COMISSAO_TOTAL = TAXAS.agroalert + TAXAS.associacao // 15%

export interface Repasse {
    bruto: number
    agroalert: number
    associacao: number
    produtor: number
}

// divide o valor vendido de produtos entre produtor, associacao e AgroAlert
export function calcularRepasse(valorProdutos: number): Repasse {
    const agroalert = valorProdutos * TAXAS.agroalert
    const associacao = valorProdutos * TAXAS.associacao
    return {
        bruto: valorProdutos,
        agroalert,
        associacao,
        produtor: valorProdutos - agroalert - associacao,
    }
}

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function moeda(valor: number): string {
    return formatadorMoeda.format(valor)
}

export function porcentagem(fracao: number): string {
    return `${Math.round(fracao * 1000) / 10}%`.replace('.', ',')
}
