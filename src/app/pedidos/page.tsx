import type { Metadata } from 'next'
import { Suspense } from 'react'
import RotaProtegida from '@/components/RotaProtegida'
import MeusPedidos from '@/components/MeusPedidos'

export const metadata: Metadata = { title: 'Meus pedidos' }

export default function PedidosPagina() {
    return (
        <RotaProtegida perfil="consumidor">
            <Suspense>
                <MeusPedidos />
            </Suspense>
        </RotaProtegida>
    )
}
