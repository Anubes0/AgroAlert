'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import type { Perfil } from '@/types'

// "rota protegida": so renderiza o conteudo para o perfil certo; senao
// manda para /entrar com o caminho de volta. Espera o localStorage carregar
// (pronto) para nao expulsar quem ja estava logado.
export default function RotaProtegida({ perfil, children }: { perfil: Perfil; children: ReactNode }) {
    const { usuario, pronto } = useAuth()
    const router = useRouter()
    const caminho = usePathname()
    const autorizado = usuario?.perfil === perfil

    useEffect(() => {
        if (pronto && !autorizado) {
            router.replace(`/entrar?perfil=${perfil}&volta=${encodeURIComponent(caminho)}`)
        }
    }, [pronto, autorizado, perfil, caminho, router])

    if (!pronto || !autorizado) {
        return (
            <div className="pagina-app">
                <div className="estado">Verificando acesso...</div>
            </div>
        )
    }

    return <>{children}</>
}
