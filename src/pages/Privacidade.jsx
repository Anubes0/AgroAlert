import useAnimaScroll from '../hooks/useAnimaScroll'
import '../styles/PaginaInterna.css'
import './Privacidade.css'

function Privacidade({ navegarPara }) {
    useAnimaScroll('privacidade')

    return (
        <>
            <section className="hero-pagina">
                <button type="button" className="trilha-volta" onClick={() => navegarPara('home')}>← Voltar para a Home</button>
                <p className="badge-secao">Privacidade · LGPD</p>
                <h1>Política de Privacidade e LGPD</h1>
                <p>Como o AgroAlert coleta, usa, compartilha e protege os seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
            </section>

            <section className="conteudo-pagina">
                <div className="documento anima-scroll">

                    <div className="aviso-academico">
                        Aviso: o AgroAlert é um protótipo acadêmico desenvolvido para o PBL Agrotech da FIAP. Este documento é um modelo de política de privacidade para fins didáticos e não representa um serviço comercial em operação.
                    </div>

                    <h2>1. Introdução</h2>
                    <p>Esta Política de Privacidade descreve como o AgroAlert trata os dados pessoais de produtores rurais, compradores e visitantes do site. Ao utilizar a plataforma, você declara estar ciente das práticas aqui descritas.</p>

                    <h2>2. Controlador dos dados</h2>
                    <p>O controlador responsável pelas decisões de tratamento dos dados é o AgroAlert (projeto acadêmico). O contato para assuntos de privacidade está na seção "Como exercer seus direitos".</p>

                    <h2 id="lgpd">3. Dados que coletamos</h2>
                    <p>Coletamos apenas o necessário para conectar produtores e compradores. As categorias de dados e suas finalidades são:</p>
                    <table className="tabela-dados">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Exemplos</th>
                                <th>Finalidade</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Identificação e contato</td>
                                <td>Nome, e-mail, telefone/WhatsApp</td>
                                <td>Cadastro, comunicação e suporte</td>
                            </tr>
                            <tr>
                                <td>Localização</td>
                                <td>Cidade, endereço ou coordenadas (lat/lng)</td>
                                <td>Geolocalização da área de venda e busca de compradores próximos</td>
                            </tr>
                            <tr>
                                <td>Conteúdo do anúncio</td>
                                <td>Produto, quantidade, preço, urgência</td>
                                <td>Intermediar a oferta e a procura</td>
                            </tr>
                            <tr>
                                <td>Dados de uso</td>
                                <td>Páginas acessadas, interações</td>
                                <td>Melhoria do serviço e métricas de impacto</td>
                            </tr>
                        </tbody>
                    </table>

                    <h2>4. Como usamos a geolocalização</h2>
                    <p>A localização é o dado central para o funcionamento da plataforma. Ela é usada exclusivamente para:</p>
                    <ul>
                        <li>converter o endereço do produtor em coordenadas;</li>
                        <li>calcular o raio da área de venda;</li>
                        <li>identificar e notificar apenas compradores dentro dessa área.</li>
                    </ul>
                    <p>Não usamos a localização para rastreamento contínuo nem a compartilhamos com terceiros fora do propósito de aproximar produtor e comprador.</p>

                    <h2>5. Finalidades e bases legais (art. 7º da LGPD)</h2>
                    <p>O tratamento de dados se apoia nas seguintes bases legais:</p>
                    <ul>
                        <li><strong>Consentimento</strong> — quando você aceita esta política ao enviar o formulário ou se cadastrar;</li>
                        <li><strong>Execução de contrato</strong> — para prestar o serviço de intermediação que você solicitou;</li>
                        <li><strong>Legítimo interesse</strong> — para melhorar a segurança e a experiência da plataforma, sempre respeitando os seus direitos.</li>
                    </ul>

                    <h2>6. Compartilhamento de dados</h2>
                    <p>Compartilhamos somente o estritamente necessário para a transação: dados do anúncio são exibidos a compradores selecionados pela proximidade. Podemos usar operadores (ex.: provedores de mensageria e hospedagem) que tratam dados em nosso nome, sob obrigações de confidencialidade. Não vendemos dados pessoais.</p>

                    <h2>7. Armazenamento e segurança</h2>
                    <p>Adotamos medidas técnicas e organizacionais razoáveis para proteger seus dados, como controle de acesso e transmissão por canais seguros (HTTPS). Nenhum sistema é totalmente imune a riscos, mas trabalhamos para minimizá-los.</p>

                    <h2>8. Retenção dos dados</h2>
                    <p>Mantemos os dados apenas pelo tempo necessário às finalidades descritas ou conforme exigências legais. Após esse período, os dados são eliminados ou anonimizados.</p>

                    <h2>9. Direitos do titular (art. 18 da LGPD)</h2>
                    <p>Você pode, a qualquer momento, solicitar:</p>
                    <ul>
                        <li>confirmação da existência de tratamento;</li>
                        <li>acesso aos seus dados;</li>
                        <li>correção de dados incompletos ou desatualizados;</li>
                        <li>anonimização, bloqueio ou eliminação de dados desnecessários;</li>
                        <li>portabilidade dos dados a outro fornecedor;</li>
                        <li>informação sobre com quem os dados foram compartilhados;</li>
                        <li>revogação do consentimento.</li>
                    </ul>

                    <h2>10. Como exercer seus direitos</h2>
                    <p>
                        Para exercer qualquer um desses direitos, entre em contato com o Encarregado de Dados (DPO) pelo e-mail{' '}
                        <a href="mailto:privacidade@agroalert.com.br" className="link-verde">privacidade@agroalert.com.br</a> ou pela página{' '}
                        <button type="button" className="link-verde link-como-texto" onClick={() => navegarPara('home', 'secao-contato')}>Fale Conosco</button>. Responderemos no menor prazo possível.
                    </p>

                    <h2>11. Cookies</h2>
                    <p>Este protótipo não utiliza cookies de rastreamento publicitário. Eventuais cookies servem apenas ao funcionamento básico do site.</p>

                    <h2 id="termos">12. Termos de uso (resumo)</h2>
                    <p>Ao usar o AgroAlert você concorda em fornecer informações verdadeiras nos anúncios, utilizar a plataforma de forma lícita e respeitar os demais usuários. O AgroAlert atua como intermediador da conexão entre produtor e comprador; a negociação, a entrega e o pagamento são de responsabilidade das partes envolvidas. Os planos são sem fidelidade e podem ser cancelados a qualquer momento.</p>

                    <h2>13. Alterações desta política</h2>
                    <p>Esta política pode ser atualizada para refletir melhorias no serviço ou mudanças legais. A versão vigente estará sempre disponível nesta página.</p>

                    <p className="meta-doc">Última atualização: junho de 2026 · Versão 1.0</p>

                </div>

                <div className="centralizar-cta" style={{ marginTop: '40px' }}>
                    <button type="button" className="cta-pagina" onClick={() => navegarPara('home', 'secao-contato')}>
                        Falar com a gente →
                    </button>
                </div>
            </section>
        </>
    )
}

export default Privacidade
