'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { pontos, produtores } from '@/data/catalogo'
import type { Perfil } from '@/types'

const PERFIS: { id: Perfil; emoji: string; titulo: string; texto: string; destino: string }[] = [
    { id: 'consumidor', emoji: '🧺', titulo: 'Consumidor', texto: 'Encomendar hortifrúti natural e retirar no sábado.', destino: '/ofertas' },
    { id: 'produtor', emoji: '🌱', titulo: 'Produtor', texto: 'Publicar ofertas, ver romaneio, clima e extrato.', destino: '/painel' },
    { id: 'ponto', emoji: '🏪', titulo: 'Ponto de retirada', texto: 'Registrar recebimento e retirada (QR).', destino: '/ponto' },
]

function perfilValido(valor: string | null): valor is Perfil {
    return valor === 'consumidor' || valor === 'produtor' || valor === 'ponto'
}

// Login SIMULADO (sem senha): escolhe o perfil e uma conta de demonstracao.
// A sessao vai para o AuthContext, que persiste no localStorage.
export default function Entrar() {
    const router = useRouter()
    const parametros = useSearchParams()
    const { entrar } = useAuth()

    const perfilInicial = parametros.get('perfil')
    const volta = parametros.get('volta')

    const [perfil, setPerfil] = useState<Perfil>(perfilValido(perfilInicial) ? perfilInicial : 'consumidor')
    const [nome, setNome] = useState('Marina Costa')
    const [produtorId, setProdutorId] = useState(produtores[0].id)
    const [pontoId, setPontoId] = useState(pontos[0].id)
    const [erro, setErro] = useState('')

    function aoEnviar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const destinoPadrao = PERFIS.find((p) => p.id === perfil)?.destino ?? '/'
        // so aceita "volta" interna (comeca com /) — evita redirecionamento aberto
        const destino = volta && volta.startsWith('/') && !volta.startsWith('//') ? volta : destinoPadrao

        if (perfil === 'consumidor') {
            const partes = nome.trim().split(/\s+/)
            if (partes.length < 2 || partes.some((p) => p.length < 2)) {
                setErro('Informe nome e sobrenome.')
                return
            }
            entrar({ perfil, nome: nome.trim() })
        } else if (perfil === 'produtor') {
            const p = produtores.find((x) => x.id === produtorId)
            entrar({ perfil, nome: p?.nome ?? 'Produtor', produtorId })
        } else {
            const p = pontos.find((x) => x.id === pontoId)
            entrar({ perfil, nome: p?.nome ?? 'Ponto', pontoId })
        }
        router.push(destino)
    }

    return (
        <div className="pagina-app" style={{ maxWidth: 860 }}>
            <header className="cabecalho-pagina">
                <h1>Entrar no AgroAlert</h1>
                <p>
                    Protótipo acadêmico: o acesso é <strong>simulado</strong>, sem senha. Escolha um perfil e uma conta de demonstração — a
                    sessão fica salva neste navegador.
                </p>
            </header>

            <form onSubmit={aoEnviar} noValidate>
                <div className="perfis" role="radiogroup" aria-label="Perfil de acesso">
                    {PERFIS.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            role="radio"
                            aria-checked={perfil === p.id}
                            className={`perfil-opcao ${perfil === p.id ? 'ativo' : ''}`}
                            onClick={() => {
                                setPerfil(p.id)
                                setErro('')
                            }}
                        >
                            <span className="emoji" aria-hidden="true">{p.emoji}</span>
                            <strong>{p.titulo}</strong>
                            <span>{p.texto}</span>
                        </button>
                    ))}
                </div>

                <div className="caixa">
                    {perfil === 'consumidor' && (
                        <label className="campo">
                            Seu nome e sobrenome
                            <input value={nome} onChange={(e) => { setNome(e.target.value); setErro('') }} autoComplete="name" aria-invalid={Boolean(erro)} />
                            {erro && <span className="erro-campo">{erro}</span>}
                        </label>
                    )}
                    {perfil === 'produtor' && (
                        <label className="campo">
                            Conta de demonstração (produtor)
                            <select value={produtorId} onChange={(e) => setProdutorId(e.target.value)}>
                                {produtores.map((p) => (
                                    <option key={p.id} value={p.id}>{p.sitio} — {p.nome} ({p.cidade})</option>
                                ))}
                            </select>
                            <span className="dica-campo">No sistema real, o cadastro é feito pela associação (cadastro assistido).</span>
                        </label>
                    )}
                    {perfil === 'ponto' && (
                        <label className="campo">
                            Conta de demonstração (ponto)
                            <select value={pontoId} onChange={(e) => setPontoId(e.target.value)}>
                                {pontos.map((p) => (
                                    <option key={p.id} value={p.id}>{p.nome} — {p.bairro}</option>
                                ))}
                            </select>
                        </label>
                    )}

                    <div className="acoes">
                        <button type="submit" className="btn btn-primario">Entrar →</button>
                    </div>
                </div>
            </form>
        </div>
    )
}
