'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/context/AuthContext'
import { CicloProvider } from '@/context/CicloContext'
import { LojaProvider } from '@/context/LojaContext'
import useAnimaScroll from '@/hooks/useAnimaScroll'

function AnimaScroll() {
    // reobserva a cada troca de rota
    useAnimaScroll(usePathname())
    return null
}

// todos os contextos globais num lugar so, usados pelo layout raiz
export default function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <CicloProvider>
                <LojaProvider>
                    <AnimaScroll />
                    {children}
                </LojaProvider>
            </CicloProvider>
        </AuthProvider>
    )
}
