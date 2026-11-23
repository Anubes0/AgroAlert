import type { Metadata } from 'next'
import RotaProtegida from '@/components/RotaProtegida'
import PainelProdutor from '@/components/PainelProdutor'

export const metadata: Metadata = { title: 'Painel do produtor' }

export default function PainelPagina() {
    return (
        <RotaProtegida perfil="produtor">
            <PainelProdutor />
        </RotaProtegida>
    )
}
