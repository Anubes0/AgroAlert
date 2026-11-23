import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// a pagina do detalhe e um Client Component (nao exporta metadata), entao o
// titulo da aba fica neste layout do segmento
export const metadata: Metadata = { title: 'Oferta' }

export default function Layout({ children }: { children: ReactNode }) {
    return children
}
