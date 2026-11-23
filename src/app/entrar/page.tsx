import type { Metadata } from 'next'
import { Suspense } from 'react'
import Entrar from '@/components/Entrar'

export const metadata: Metadata = { title: 'Entrar' }

export default function EntrarPagina() {
    return (
        <Suspense>
            <Entrar />
        </Suspense>
    )
}
