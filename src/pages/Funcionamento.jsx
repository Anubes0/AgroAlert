import useAnimaScroll from '../hooks/useAnimaScroll'
import '../styles/PaginaInterna.css'
import './Funcionamento.css'

const etapas = [
    {
        papel: 'Produtor',
        titulo: 'Envio da mensagem no WhatsApp',
        texto: 'O produtor manda uma mensagem de texto livre para o número do AgroAlert, sem formulários nem aplicativos. Um exemplo real seria:',
        destaque: '"Tenho 50kg de tomate, colheita de hoje, R$0,80/kg, em São Paulo."',
        itens: [
            'Canal único e familiar: o WhatsApp que o produtor já usa.',
            'Aceita áudio e texto; nada precisa ser instalado.',
        ],
    },
    {
        papel: 'Bot · Processamento',
        titulo: 'Recepção e interpretação da mensagem',
        texto: 'A mensagem chega via API de mensageria (Twilio/WhatsApp Business API) e é interpretada por um módulo de processamento de linguagem natural que extrai os dados estruturados do texto:',
        itens: [
            <><strong>Produto:</strong> tomate</>,
            <><strong>Quantidade:</strong> 50 kg</>,
            <><strong>Preço:</strong> R$ 0,80/kg</>,
            <><strong>Urgência:</strong> alta (colheita do dia)</>,
            <><strong>Localização declarada:</strong> São Paulo</>,
        ],
    },
    {
        papel: 'Geocodificação',
        titulo: 'Conversão da localização em coordenadas',
        texto: 'A localização informada (ou a compartilhada pelo próprio WhatsApp) é convertida em coordenadas geográficas — latitude e longitude — por um serviço de geocodificação. É esse ponto que ancora toda a busca seguinte no mapa.',
        itens: [
            'Endereço ou cidade → par (lat, lng).',
            'Quando o produtor envia a localização do WhatsApp, as coordenadas já vêm prontas e mais precisas.',
        ],
    },
    {
        papel: 'Geolocalização · Matching',
        titulo: 'Definição do raio e busca da área de venda',
        texto: 'Com o ponto do produtor no mapa, o sistema desenha um raio de busca (de 5 a 100 km, conforme o plano) e faz um cruzamento geoespacial: identifica quais compradores cadastrados estão dentro dessa área de venda.',
        itens: [
            <>O raio define a <strong>área de venda</strong> — a região onde faz sentido escoar aquele produto perecível.</>,
            'A distância é calculada entre as coordenadas do produtor e as de cada comprador.',
            'Compradores fora do raio são descartados; só os próximos seguem para a etapa de alerta.',
        ],
    },
    {
        papel: 'Compradores',
        titulo: 'Notificação instantânea dos compradores próximos',
        texto: 'Apenas os compradores dentro da área de venda — e que tenham interesse naquele tipo de produto — recebem um alerta instantâneo via WhatsApp e/ou e-mail, com produto, quantidade, preço e distância aproximada.',
        itens: [
            'Filtro duplo: proximidade geográfica + interesse no produto.',
            'Evita spam: quem está longe ou não compra aquilo não é incomodado.',
        ],
    },
    {
        papel: 'Negociação',
        titulo: 'Respostas e propostas',
        texto: 'Os compradores interessados respondem e o produtor recebe as propostas reunidas. Ele compara preço, distância e condições e escolhe com quem fechar.',
    },
    {
        papel: 'Fechamento',
        titulo: 'Fechamento P2P e logística',
        texto: 'Produtor e comprador combinam entrega e pagamento diretamente, sem intermediários ficando com a margem. A plataforma registra o negócio para histórico e métricas de impacto.',
    },
]

function Funcionamento({ navegarPara }) {
    useAnimaScroll('funcionamento')

    return (
        <>
            <section className="hero-pagina">
                <button type="button" className="trilha-volta" onClick={() => navegarPara('home')}>← Voltar para a Home</button>
                <p className="badge-secao">Passo a passo detalhado</p>
                <h1>Como o AgroAlert funciona por dentro</h1>
                <p>Do momento em que o produtor envia uma mensagem no WhatsApp até a geolocalização da área de venda e a notificação dos compradores certos. Veja cada etapa do processo.</p>
            </section>

            <section className="conteudo-pagina">

                <div className="timeline anima-scroll">
                    {etapas.map((etapa, indice) => (
                        <div className="etapa" key={etapa.titulo}>
                            <span className="marcador" aria-hidden="true">{indice + 1}</span>
                            <span className="papel">{etapa.papel}</span>
                            <h3>{etapa.titulo}</h3>
                            <p>{etapa.texto}</p>
                            {etapa.destaque && <p className="destaque-etapa">{etapa.destaque}</p>}
                            {etapa.itens && (
                                <ul>
                                    {etapa.itens.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>

                {/* destaque: geolocalizacao da area de venda */}
                <div className="bloco-geo anima-scroll">
                    <h3>Em foco: a geolocalização da área de venda</h3>
                    <p>O coração do AgroAlert é transformar "onde estou" em "quem pode comprar perto de mim". O ponto central é o produtor; os anéis representam o raio de busca; cada ponto é um comprador. Só quem cai dentro do raio entra na área de venda e recebe o alerta.</p>

                    <div className="mapa-raio" role="img" aria-label="Mapa esquemático mostrando o produtor no centro, o raio de busca e os compradores dentro e fora da área de venda">
                        <div className="anel r3"></div>
                        <div className="anel r2"></div>
                        <div className="anel r1"></div>
                        <div className="centro" title="Produtor"></div>
                        <div className="ponto" style={{ top: '38%', left: '58%' }} title="Comprador dentro do raio"></div>
                        <div className="ponto" style={{ top: '60%', left: '42%' }} title="Comprador dentro do raio"></div>
                        <div className="ponto" style={{ top: '50%', left: '66%' }} title="Comprador dentro do raio"></div>
                        <div className="ponto fora" style={{ top: '14%', left: '24%' }} title="Comprador fora do raio"></div>
                        <div className="ponto fora" style={{ top: '84%', left: '80%' }} title="Comprador fora do raio"></div>
                    </div>

                    <div className="legenda-mapa">
                        <span><span className="bolinha" style={{ background: 'var(--cor-verde)' }}></span> Produtor (centro)</span>
                        <span><span className="bolinha" style={{ background: 'var(--cor-azul)' }}></span> Comprador na área de venda</span>
                        <span><span className="bolinha" style={{ background: 'var(--cor-texto-fraco)' }}></span> Comprador fora do raio</span>
                    </div>
                </div>

                <div className="centralizar-cta" style={{ marginTop: '48px' }}>
                    <button type="button" className="cta-pagina" onClick={() => navegarPara('home', 'secao-planos')}>
                        Ver planos e começar →
                    </button>
                </div>

            </section>
        </>
    )
}

export default Funcionamento
