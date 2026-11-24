'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLoja } from '@/context/LojaContext'
import useAgora from '@/hooks/useAgora'
import CardPedido from './CardPedido'

export default function MeusPedidos() {
    const { usuario } = useAuth()
    const { pedidos } = useLoja()
    const agora = useAgora()
    const novo = useSearchParams().get('novo')

    // sem back-end, o pedido e ligado ao consumidor pelo nome; normaliza
    // espacos e maiusculas ("marina  costa" = "Marina Costa")
    const normalizar = (nome = '') => nome.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR')
    const meus = pedidos.filter((p) => normalizar(p.consumidor) === normalizar(usuario?.nome))

    return (
        <div className="pagina-app">
            <header className="cabecalho-pagina">
                <h1>Meus pedidos</h1>
                <p>Acompanhe cada etapa: pagamento retido, colheita, chegada ao ponto e retirada com QR code.</p>
            </header>

            {novo && (
                <p className="aviso aviso-ok" role="status" style={{ marginBottom: 20 }}>
                    ✓ Pedido <strong>{novo}</strong> criado! O Pix foi confirmado e o valor está retido até a retirada no sábado.
                </p>
            )}

            {meus.length === 0 ? (
                <div className="estado">
                    <p>Você ainda não fez pedidos neste navegador.</p>
                    <Link className="btn btn-primario" href="/ofertas">Ver ofertas da semana</Link>
                </div>
            ) : (
                <div className="pilha">
                    {meus.map((p) => <CardPedido key={p.id} pedido={p} agora={agora} destaque={p.codigo === novo} />)}
                </div>
            )}
        </div>
    )
}
