import type { Categoria, Classe, Selo, StatusExibido, TipoPonto } from '@/types'

// textos exibidos na interface para cada valor dos tipos de dominio.
// Record<Tipo, string> obriga o TypeScript a cobrar um rotulo para cada valor.

export const ROTULO_CATEGORIA: Record<Categoria, string> = {
    folhosas: 'Folhosas',
    ervas: 'Ervas',
    frutas: 'Frutas',
    legumes: 'Legumes',
    raizes: 'Raízes',
}

export const ROTULO_CLASSE: Record<Classe, string> = {
    padrao: 'Padrão',
    'feio-mas-bom': 'Feio mas bom',
}

export const SELOS: Record<Selo, { rotulo: string; curto: string; descricao: string }> = {
    certificado: {
        rotulo: 'Orgânico certificado',
        curto: 'Orgânico',
        descricao: 'Certificado por auditoria ou por um Sistema Participativo de Garantia (SPG) e registrado no Cadastro Nacional de Produtores Orgânicos, do Ministério da Agricultura.',
    },
    ocs: {
        rotulo: 'Orgânico — venda direta (OCS)',
        curto: 'Orgânico OCS',
        descricao: 'Agricultor familiar ligado a uma Organização de Controle Social (OCS), registrado no Ministério da Agricultura. Pode vender direto ao consumidor sem selo de certificadora.',
    },
    transicao: {
        rotulo: 'Em transição agroecológica',
        curto: 'Em transição',
        descricao: 'Produção natural sem registro oficial: autodeclarada, com fotos e visita da associação. Não usa a palavra "orgânico".',
    },
}

export const ROTULO_TIPO_PONTO: Record<TipoPonto, string> = {
    comercio: 'Comércio parceiro',
    condominio: 'Condomínio / empresa',
    feira: 'Banca na feira',
    comunitario: 'Espaço comunitário',
}

export const ROTULO_STATUS: Record<StatusExibido, string> = {
    pago: 'Pago · valor retido',
    'em-colheita': 'Em colheita · a caminho',
    'no-ponto': 'Chegou ao ponto',
    retirado: 'Retirado',
    'em-reclamacao': 'Em reclamação',
    confirmado: 'Confirmado · repasse liberado',
    'nao-retirado': 'Não retirado · doado',
}
