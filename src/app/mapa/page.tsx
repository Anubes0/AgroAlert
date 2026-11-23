import type { Metadata } from 'next'
import MapaCliente from '@/components/MapaCliente'

export const metadata: Metadata = { title: 'Mapa de pontos de retirada' }

export default function MapaPagina() {
    return (
        <div style={{ paddingTop: 30 }}>
            <MapaCliente />
        </div>
    )
}
