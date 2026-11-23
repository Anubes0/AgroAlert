import type { Metadata } from 'next'
import RotaProtegida from '@/components/RotaProtegida'
import PainelPonto from '@/components/PainelPonto'

export const metadata: Metadata = { title: 'Painel do ponto de retirada' }

export default function PontoPagina() {
    return (
        <RotaProtegida perfil="ponto">
            <PainelPonto />
        </RotaProtegida>
    )
}
