import Link from 'next/link'
import { COMISSAO_TOTAL, TAXAS } from '@/lib/taxas'
import './Planos.css'

// Fase 7: sai a mensalidade do produtor (R$ 39/89) e do comprador B2B (R$ 59).
// Cada lado paga so quando ha venda (Parte 3 do modelo de negocio).
const planos = [
    {
        id: 'plano-produtor',
        nome: 'Produtor',
        descricao: 'Agricultor familiar via associação',
        preco: 'Grátis',
        periodo: `${Math.round(COMISSAO_TOTAL * 100)}% só sobre o que vender`,
        destaque: true,
        features: [
            'Sem mensalidade',
            'Painel de ofertas da semana',
            'Romaneio automático',
            'Alerta de clima para colheita',
            'Pagamento garantido',
            'Selo de procedência',
        ],
        rotulo: 'Quero vender ◉',
        href: '/entrar?perfil=produtor',
        classe: 'btn-plano-principal',
    },
    {
        id: 'plano-consumidor',
        nome: 'Consumidor',
        descricao: 'Para quem busca comida de verdade',
        preco: `R$ ${TAXAS.taxaRetirada}`,
        periodo: 'de taxa de retirada por pedido',
        destaque: false,
        features: [
            'Hortifrúti natural com selo',
            'Retirada no seu bairro',
            'Pagamento retido até retirar',
            `Cesta por assinatura −${Math.round(TAXAS.descontoAssinatura * 100)}%`,
            'Reclamação em 24h/48h',
        ],
        rotulo: 'Ver ofertas',
        href: '/ofertas',
        classe: 'btn-plano-secundario',
    },
    {
        id: 'plano-ponto',
        nome: 'Ponto parceiro',
        descricao: 'Empórios, condomínios, feiras',
        preco: `+R$ ${TAXAS.partePonto}`,
        periodo: 'que você recebe por pedido',
        destaque: false,
        features: [
            'Clientes do seu nicho na porta',
            'Sábado 9h–13h',
            'Leitura de QR pelo celular',
            'Sem estoque, sem risco',
        ],
        rotulo: 'Ser ponto',
        href: '/entrar?perfil=ponto',
        classe: 'btn-plano-secundario',
    },
    {
        id: 'plano-industria',
        nome: 'Indústria',
        descricao: 'Polpas, molhos e conservas',
        preco: `${Math.round(TAXAS.industria * 100)}%`,
        periodo: 'sobre lotes fora de padrão',
        destaque: false,
        features: [
            'Lotes semanais agregados',
            'Retirada no hub',
            'Produto natural rastreável',
            'Preço abaixo do padrão',
        ],
        rotulo: 'Falar com a gente',
        href: '/#secao-contato',
        classe: 'btn-plano-secundario',
    },
]

export default function Planos() {
    return (
        <section id="secao-planos">
            <div className="titulo-secao anima-scroll">
                <p className="badge-secao">Quanto custa</p>
                <h2>Cada um paga só quando há venda</h2>
                <p>Sem mensalidade para o produtor · sem fidelidade para ninguém</p>
            </div>

            <div id="grade-planos" className="grade-planos-4 anima-scroll">
                {planos.map((plano) => (
                    <div className="card-plano" id={plano.destaque ? 'plano-destaque' : plano.id} key={plano.id}>
                        {plano.destaque && <span className="badge-popular">✦ Entrada grátis</span>}
                        <h3 className="nome-plano">{plano.nome}</h3>
                        <p className="descricao-plano">{plano.descricao}</p>
                        <p className="preco-plano">{plano.preco}</p>
                        <p className="periodo-plano">{plano.periodo}</p>
                        <hr className="divisor-plano" />
                        <ul className="lista-features">
                            {plano.features.map((f) => (
                                <li className="ativo" key={f}>{f}</li>
                            ))}
                        </ul>
                        <Link className={plano.classe} href={plano.href}>
                            {plano.rotulo}
                        </Link>
                    </div>
                ))}
            </div>

            <p id="rodape-planos">Valores do piloto (Grande São Paulo) — estimativas a validar na operação real</p>
        </section>
    )
}
