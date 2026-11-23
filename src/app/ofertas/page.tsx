import type { Metadata } from 'next'
import { Suspense } from 'react'
import Vitrine from '@/components/Vitrine'

export const metadata: Metadata = { title: 'Ofertas da semana' }

// useSearchParams() (filtro ?produtor=) exige um <Suspense> em volta
// para a rota continuar sendo pre-renderizada como estatica
export default function OfertasPagina() {
    return (
        <Suspense fallback={<div className="pagina-app"><div className="estado">Carregando...</div></div>}>
            <Vitrine />
        </Suspense>
    )
}
