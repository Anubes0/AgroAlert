import type { Associacao, Oferta, PontoRetirada, Produtor } from '@/types'

// Dados FICTICIOS do piloto (Grande Sao Paulo). Num sistema real viriam do
// banco (Supabase, na fase de escala). As ofertas sao servidas pela rota
// /api/ofertas para que o front consuma como se fosse um back-end.

export const associacoes: Associacao[] = [
    {
        id: 'a1',
        nome: 'Associação Raízes do Cinturão Verde',
        cidade: 'Ibiúna - SP',
        lat: -23.6563,
        lng: -47.2228,
    },
    {
        id: 'a2',
        nome: 'Coletivo Terra Viva do Alto Tietê',
        cidade: 'Mogi das Cruzes - SP',
        lat: -23.5229,
        lng: -46.1883,
    },
]

export const produtores: Produtor[] = [
    {
        id: 'p1',
        nome: 'Dona Cida Moraes',
        sitio: 'Sítio Boa Vista',
        associacaoId: 'a1',
        cidade: 'Ibiúna - SP',
        lat: -23.6702,
        lng: -47.2551,
        selo: 'certificado',
        taxaCumprimento: 0.98,
        desde: 2026,
    },
    {
        id: 'p2',
        nome: 'Seu Jorge Tanaka',
        sitio: 'Chácara Santa Luzia',
        associacaoId: 'a1',
        cidade: 'Piedade - SP',
        lat: -23.7121,
        lng: -47.4274,
        selo: 'ocs',
        taxaCumprimento: 0.95,
        desde: 2026,
    },
    {
        id: 'p3',
        nome: 'Família Oliveira',
        sitio: 'Sítio Pé de Serra',
        associacaoId: 'a1',
        cidade: 'Cotia - SP',
        lat: -23.6538,
        lng: -46.9502,
        selo: 'transicao',
        taxaCumprimento: 0.9,
        desde: 2026,
    },
    {
        id: 'p4',
        nome: 'Ana e Paulo Ribeiro',
        sitio: 'Sítio Água Limpa',
        associacaoId: 'a2',
        cidade: 'Biritiba Mirim - SP',
        lat: -23.5726,
        lng: -46.0386,
        selo: 'ocs',
        taxaCumprimento: 0.97,
        desde: 2026,
    },
    {
        id: 'p5',
        nome: 'Seu Toninho Lima',
        sitio: 'Sítio Três Irmãos',
        associacaoId: 'a2',
        cidade: 'Suzano - SP',
        lat: -23.5617,
        lng: -46.3101,
        selo: 'certificado',
        taxaCumprimento: 0.99,
        desde: 2026,
    },
    {
        id: 'p6',
        nome: 'Marta Yamamoto',
        sitio: 'Chácara do Vale',
        associacaoId: 'a2',
        cidade: 'Mogi das Cruzes - SP',
        lat: -23.4891,
        lng: -46.1502,
        selo: 'transicao',
        taxaCumprimento: 0.88,
        desde: 2026,
    },
]

export const pontos: PontoRetirada[] = [
    {
        id: 'r1',
        nome: 'Empório Grão Natural',
        tipo: 'comercio',
        endereco: 'R. Fradique Coutinho, 1200',
        bairro: 'Vila Madalena',
        lat: -23.5568,
        lng: -46.6912,
    },
    {
        id: 'r2',
        nome: 'Condomínio Parque das Árvores',
        tipo: 'condominio',
        endereco: 'Av. Corifeu de Azevedo Marques, 3000',
        bairro: 'Butantã',
        lat: -23.5713,
        lng: -46.7396,
    },
    {
        id: 'r3',
        nome: 'Banca do Sítio Boa Vista — Feira de Produtores',
        tipo: 'feira',
        endereco: 'Av. Francisco Matarazzo, 455',
        bairro: 'Água Branca',
        lat: -23.5275,
        lng: -46.6688,
    },
    {
        id: 'r4',
        nome: 'Associação de Moradores da Vila Mariana',
        tipo: 'comunitario',
        endereco: 'R. Domingos de Morais, 900',
        bairro: 'Vila Mariana',
        lat: -23.5891,
        lng: -46.6345,
    },
    {
        id: 'r5',
        nome: 'Coworking Paulista (recepção)',
        tipo: 'condominio',
        endereco: 'Av. Paulista, 1500',
        bairro: 'Bela Vista',
        lat: -23.5614,
        lng: -46.6559,
    },
]

export const ofertasIniciais: Oferta[] = [
    { id: 'o1', produtorId: 'p1', produto: 'Alface crespa', categoria: 'folhosas', classe: 'padrao', unidade: 'un', preco: 4.5, quantidade: 60, colheita: 'semana', descricao: 'Pé grande, colhido na sexta de madrugada.' },
    { id: 'o2', produtorId: 'p1', produto: 'Rúcula', categoria: 'folhosas', classe: 'padrao', unidade: 'maço', preco: 5, quantidade: 40, colheita: 'semana', descricao: 'Folha pequena, sabor marcante.' },
    { id: 'o3', produtorId: 'p1', produto: 'Morango', categoria: 'frutas', classe: 'padrao', unidade: 'bandeja', preco: 12, quantidade: 30, colheita: 'semana', descricao: 'Bandeja de 250 g, sem agrotóxicos.' },
    { id: 'o4', produtorId: 'p2', produto: 'Tomate italiano', categoria: 'legumes', classe: 'padrao', unidade: 'kg', preco: 14, quantidade: 45, colheita: 'semana', descricao: 'Maduro no pé, ideal para salada e molho.' },
    { id: 'o5', produtorId: 'p2', produto: 'Tomate italiano', categoria: 'legumes', classe: 'feio-mas-bom', unidade: 'kg', preco: 8, quantidade: 30, colheita: 'semana', descricao: 'Fora do padrão de tamanho/forma — mesmo sabor, ótimo para molho.' },
    { id: 'o6', produtorId: 'p2', produto: 'Pimentão vermelho', categoria: 'legumes', classe: 'padrao', unidade: 'kg', preco: 16, quantidade: 15, colheita: 'semana', descricao: 'Casca firme e brilhante.' },
    { id: 'o7', produtorId: 'p3', produto: 'Couve manteiga', categoria: 'folhosas', classe: 'padrao', unidade: 'maço', preco: 4, quantidade: 50, colheita: 'antecipada', descricao: 'Colheita antecipada por previsão de geada.' },
    { id: 'o8', produtorId: 'p3', produto: 'Cheiro-verde', categoria: 'ervas', classe: 'padrao', unidade: 'maço', preco: 3, quantidade: 40, colheita: 'semana', descricao: 'Salsinha e cebolinha.' },
    { id: 'o9', produtorId: 'p3', produto: 'Mandioca', categoria: 'raizes', classe: 'padrao', unidade: 'kg', preco: 7, quantidade: 60, colheita: 'semana', descricao: 'Mandioca amarela, cozinha rápido. Vem com casca, que conserva por mais tempo.' },
    { id: 'o10', produtorId: 'p4', produto: 'Cenoura', categoria: 'raizes', classe: 'padrao', unidade: 'kg', preco: 9, quantidade: 40, colheita: 'semana', descricao: 'Doce e crocante.' },
    { id: 'o11', produtorId: 'p4', produto: 'Cenoura', categoria: 'raizes', classe: 'feio-mas-bom', unidade: 'kg', preco: 5, quantidade: 35, colheita: 'semana', descricao: 'Tortas ou bifurcadas — perfeitas para suco e bolo.' },
    { id: 'o12', produtorId: 'p4', produto: 'Beterraba', categoria: 'raizes', classe: 'padrao', unidade: 'kg', preco: 8, quantidade: 30, colheita: 'semana', descricao: 'Com folhas, que também se comem.' },
    { id: 'o13', produtorId: 'p5', produto: 'Banana prata', categoria: 'frutas', classe: 'padrao', unidade: 'kg', preco: 9, quantidade: 50, colheita: 'semana', descricao: 'Pencas no ponto de amadurecer em casa.' },
    { id: 'o14', produtorId: 'p5', produto: 'Abobrinha italiana', categoria: 'legumes', classe: 'padrao', unidade: 'kg', preco: 10, quantidade: 25, colheita: 'semana', descricao: 'Tamanho médio, casca fina.' },
    { id: 'o15', produtorId: 'p5', produto: 'Batata-doce', categoria: 'raizes', classe: 'feio-mas-bom', unidade: 'kg', preco: 5, quantidade: 40, colheita: 'semana', descricao: 'Formatos irregulares, mesma doçura.' },
    { id: 'o16', produtorId: 'p6', produto: 'Manjericão', categoria: 'ervas', classe: 'padrao', unidade: 'maço', preco: 4, quantidade: 30, colheita: 'semana', descricao: 'Folhas grandes e perfumadas.' },
    { id: 'o17', produtorId: 'p6', produto: 'Limão taiti', categoria: 'frutas', classe: 'padrao', unidade: 'kg', preco: 7, quantidade: 35, colheita: 'semana', descricao: 'Bem suculento.' },
    { id: 'o18', produtorId: 'p6', produto: 'Laranja pera', categoria: 'frutas', classe: 'feio-mas-bom', unidade: 'kg', preco: 4, quantidade: 60, colheita: 'antecipada', descricao: 'Casca manchada pelo vento; ótima para suco.' },
]

export function buscarProdutor(id: string): Produtor | undefined {
    return produtores.find((p) => p.id === id)
}

export function buscarAssociacao(id: string): Associacao | undefined {
    return associacoes.find((a) => a.id === id)
}

export function buscarPonto(id: string): PontoRetirada | undefined {
    return pontos.find((p) => p.id === id)
}
