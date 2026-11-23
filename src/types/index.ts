// Tipos de dominio do AgroAlert v2 (modelo de negocio: docs/modelo-negocio.md)

export type Categoria = 'folhosas' | 'ervas' | 'frutas' | 'legumes' | 'raizes'

// niveis de selo de procedencia (Lei 10.831/2003): so os dois primeiros
// podem usar a palavra "organico"
export type Selo = 'certificado' | 'ocs' | 'transicao'

// "padrao" vai para os pedidos; "feio-mas-bom" e o fora de padrao com desconto
export type Classe = 'padrao' | 'feio-mas-bom'

export type Unidade = 'kg' | 'un' | 'maço' | 'bandeja'

export type TipoColheita = 'semana' | 'antecipada'

export interface Associacao {
    id: string
    nome: string
    cidade: string
    lat: number
    lng: number
}

export interface Produtor {
    id: string
    nome: string
    sitio: string
    associacaoId: string
    cidade: string
    lat: number
    lng: number
    selo: Selo
    taxaCumprimento: number // 0..1 — % de itens entregues sem falta
    desde: number // ano de entrada
}

export interface Oferta {
    id: string
    produtorId: string
    produto: string
    categoria: Categoria
    classe: Classe
    unidade: Unidade
    preco: number // R$ por unidade
    quantidade: number // maximo que o produtor espera colher na semana
    colheita: TipoColheita
    descricao: string
}

export type TipoPonto = 'comercio' | 'condominio' | 'feira' | 'comunitario'

export interface PontoRetirada {
    id: string
    nome: string
    tipo: TipoPonto
    endereco: string
    bairro: string
    lat: number
    lng: number
}

export interface ItemCesta {
    ofertaId: string
    quantidade: number
}

// estados do pedido no "modelo Mercado Livre" (pagamento retido).
// "pago" = valor em custodia; o repasse so e liberado em "confirmado"
// ou "nao-retirado" (o produtor cumpriu a entrega no ponto).
export type StatusPedido =
    | 'pago'
    | 'no-ponto'
    | 'retirado'
    | 'em-reclamacao'
    | 'confirmado'
    | 'nao-retirado'

// "em-colheita" nao e salvo: e derivado da fase do ciclo (ver lib/pedidos.ts)
export type StatusExibido = StatusPedido | 'em-colheita'

export interface ItemPedido {
    ofertaId: string
    produtorId: string
    produto: string
    categoria: Categoria
    unidade: Unidade
    precoUnit: number
    quantidade: number
    faltante: number // quantidade nao colhida -> estornada ao consumidor
}

export interface EventoPedido {
    status: StatusExibido | 'estorno'
    em: string // ISO
    detalhe?: string
}

export interface Pedido {
    id: string
    codigo: string // ex.: AG-4821 (vai no QR code)
    consumidor: string
    pontoId: string
    itens: ItemPedido[]
    assinatura: boolean
    taxaRetirada: number
    status: StatusPedido
    historico: EventoPedido[]
    criadoEm: string
    retiradoEm?: string
    reclamacao?: string
}

export type Perfil = 'consumidor' | 'produtor' | 'ponto'

export interface Usuario {
    nome: string
    perfil: Perfil
    produtorId?: string
    pontoId?: string
}

// fases do ciclo semanal: seg->qua 20h pedidos abertos; qua 20h->sab 9h colheita;
// sab 9h->13h retirada; depois, encerrado ate segunda
export type FaseCiclo = 'aberto' | 'colheita' | 'retirada' | 'encerrado'
