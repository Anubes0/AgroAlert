'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLoja } from '@/context/LojaContext'
import { associacoes, buscarProdutor } from '@/data/catalogo'
import { ROTULO_CATEGORIA, SELOS } from '@/data/rotulos'
import type { Categoria, Classe, Oferta, Selo } from '@/types'
import CardOferta from './CardOferta'
import FaixaCiclo from './FaixaCiclo'

type Ordenacao = 'nome' | 'menor-preco' | 'maior-preco' | 'disponivel'

const CATEGORIAS = Object.keys(ROTULO_CATEGORIA) as Categoria[]

function normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function Vitrine() {
    const { ofertas, statusOfertas, recarregarOfertas, disponivel } = useLoja()
    const parametros = useSearchParams()
    const produtorDaUrl = parametros.get('produtor')

    const [busca, setBusca] = useState('')
    const [categoria, setCategoria] = useState<Categoria | 'todas'>('todas')
    const [selo, setSelo] = useState<Selo | 'todos'>('todos')
    const [classe, setClasse] = useState<Classe | 'todas'>('todas')
    const [associacao, setAssociacao] = useState('todas')
    const [ordenacao, setOrdenacao] = useState<Ordenacao>('nome')

    const produtorFiltro = produtorDaUrl ? buscarProdutor(produtorDaUrl) : undefined

    // filtros combinados (E logico) + ordenacao, recalculados so quando algo muda
    const resultado = useMemo(() => {
        const termo = normalizar(busca.trim())
        const filtradas = ofertas.filter((o: Oferta) => {
            const produtor = buscarProdutor(o.produtorId)
            if (!produtor) return false
            if (produtorFiltro && o.produtorId !== produtorFiltro.id) return false
            if (categoria !== 'todas' && o.categoria !== categoria) return false
            if (selo !== 'todos' && produtor.selo !== selo) return false
            if (classe !== 'todas' && o.classe !== classe) return false
            if (associacao !== 'todas' && produtor.associacaoId !== associacao) return false
            if (termo && !normalizar(`${o.produto} ${produtor.sitio} ${produtor.cidade}`).includes(termo)) return false
            return true
        })

        const comparar: Record<Ordenacao, (a: Oferta, b: Oferta) => number> = {
            nome: (a, b) => a.produto.localeCompare(b.produto, 'pt-BR'),
            'menor-preco': (a, b) => a.preco - b.preco,
            'maior-preco': (a, b) => b.preco - a.preco,
            disponivel: (a, b) => disponivel(b.id) - disponivel(a.id),
        }
        return [...filtradas].sort(comparar[ordenacao])
    }, [ofertas, busca, categoria, selo, classe, associacao, ordenacao, produtorFiltro, disponivel])

    const temFiltro = busca || categoria !== 'todas' || selo !== 'todos' || classe !== 'todas' || associacao !== 'todas'

    function limparFiltros() {
        setBusca('')
        setCategoria('todas')
        setSelo('todos')
        setClasse('todas')
        setAssociacao('todas')
    }

    return (
        <div className="pagina-app">
            <header className="cabecalho-pagina">
                <h1>Ofertas da semana</h1>
                <p>
                    Hortifrúti natural de agricultores familiares do cinturão verde de São Paulo. Tudo é colhido depois do
                    fechamento do ciclo — só o que foi encomendado.
                </p>
            </header>

            <FaixaCiclo />

            {produtorFiltro && (
                <p className="aviso aviso-ok" style={{ marginBottom: 16 }}>
                    Mostrando só as ofertas de <strong>{produtorFiltro.sitio}</strong> ({produtorFiltro.nome}).{' '}
                    <Link className="link-verde" href="/ofertas">Ver todas</Link>
                </p>
            )}

            <div className="barra-filtros" role="search">
                <label className="campo campo-crescer">
                    Buscar
                    <input type="search" placeholder="Produto, sítio ou cidade" value={busca} onChange={(e) => setBusca(e.target.value)} />
                </label>
                <label className="campo">
                    Selo
                    <select value={selo} onChange={(e) => setSelo(e.target.value as Selo | 'todos')}>
                        <option value="todos">Todos</option>
                        {(Object.keys(SELOS) as Selo[]).map((s) => (
                            <option key={s} value={s}>{SELOS[s].rotulo}</option>
                        ))}
                    </select>
                </label>
                <label className="campo">
                    Classe
                    <select value={classe} onChange={(e) => setClasse(e.target.value as Classe | 'todas')}>
                        <option value="todas">Todas</option>
                        <option value="padrao">Padrão</option>
                        <option value="feio-mas-bom">Feio mas bom (desconto)</option>
                    </select>
                </label>
                <label className="campo">
                    Associação
                    <select value={associacao} onChange={(e) => setAssociacao(e.target.value)}>
                        <option value="todas">Todas</option>
                        {associacoes.map((a) => (
                            <option key={a.id} value={a.id}>{a.nome}</option>
                        ))}
                    </select>
                </label>
                <label className="campo">
                    Ordenar por
                    <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}>
                        <option value="nome">Nome</option>
                        <option value="menor-preco">Menor preço</option>
                        <option value="maior-preco">Maior preço</option>
                        <option value="disponivel">Mais disponível</option>
                    </select>
                </label>
            </div>

            <div className="chips" role="group" aria-label="Filtrar por categoria">
                <button type="button" className={`chip ${categoria === 'todas' ? 'ativo' : ''}`} aria-pressed={categoria === 'todas'} onClick={() => setCategoria('todas')}>
                    Todas
                </button>
                {CATEGORIAS.map((c) => (
                    <button key={c} type="button" className={`chip ${categoria === c ? 'ativo' : ''}`} aria-pressed={categoria === c} onClick={() => setCategoria(c)}>
                        {ROTULO_CATEGORIA[c]}
                    </button>
                ))}
            </div>

            {statusOfertas === 'carregando' && (
                <div className="grade-ofertas" aria-busy="true" aria-label="Carregando ofertas">
                    {Array.from({ length: 8 }, (_, i) => <div className="esqueleto" key={i} />)}
                </div>
            )}

            {statusOfertas === 'erro' && (
                <div className="estado estado-erro" role="alert">
                    <p>Não foi possível carregar as ofertas agora.</p>
                    <button type="button" className="btn btn-secundario" onClick={recarregarOfertas}>Tentar de novo</button>
                </div>
            )}

            {statusOfertas === 'ok' && (
                <>
                    <p className="texto-fraco" style={{ marginBottom: 14 }} aria-live="polite">
                        {resultado.length} {resultado.length === 1 ? 'oferta encontrada' : 'ofertas encontradas'}
                    </p>
                    {resultado.length ? (
                        <div className="grade-ofertas">
                            {resultado.map((oferta) => <CardOferta key={oferta.id} oferta={oferta} />)}
                        </div>
                    ) : (
                        <div className="estado">
                            <p>Nenhuma oferta com esses filtros.</p>
                            {temFiltro && <button type="button" className="btn btn-secundario" onClick={limparFiltros}>Limpar filtros</button>}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
