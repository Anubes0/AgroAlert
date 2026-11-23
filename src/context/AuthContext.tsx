'use client'

import { createContext, useContext, type ReactNode } from 'react'
import usePersistente from '@/hooks/usePersistente'
import type { Usuario } from '@/types'

// Login SIMULADO: nao ha senha nem back-end. O usuario escolhe um perfil
// (consumidor, produtor ou ponto) e a sessao fica salva no localStorage.

interface AuthValor {
    usuario: Usuario | null
    pronto: boolean
    entrar: (usuario: Usuario) => void
    sair: () => void
}

const AuthContext = createContext<AuthValor | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario, pronto] = usePersistente<Usuario | null>('sessao', null)

    return (
        <AuthContext.Provider
            value={{
                usuario,
                pronto,
                entrar: setUsuario,
                sair: () => setUsuario(null),
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthValor {
    const valor = useContext(AuthContext)
    if (!valor) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
    return valor
}
