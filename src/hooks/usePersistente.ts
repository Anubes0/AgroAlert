'use client'

import { useCallback, useEffect, useState } from 'react'

const PREFIXO = 'agroalert:'

// useState sincronizado com o localStorage.
// O servidor do Next renderiza sem localStorage, entao a leitura acontece
// dentro do useEffect (depois da hidratacao) — ler no primeiro render faria
// o HTML do cliente divergir do HTML do servidor. "pronto" avisa quando o
// valor salvo ja foi carregado (ex.: para nao redirecionar antes da hora).
export default function usePersistente<T>(chave: string, inicial: T) {
    const [valor, setValor] = useState<T>(inicial)
    const [pronto, setPronto] = useState(false)

    useEffect(() => {
        try {
            const salvo = window.localStorage.getItem(PREFIXO + chave)
            if (salvo !== null) setValor(JSON.parse(salvo) as T)
        } catch {
            // JSON corrompido ou storage bloqueado: segue com o valor inicial
        }
        setPronto(true)
    }, [chave])

    useEffect(() => {
        if (!pronto) return
        try {
            window.localStorage.setItem(PREFIXO + chave, JSON.stringify(valor))
        } catch {
            // cota cheia / modo privado: o estado continua funcionando em memoria
        }
    }, [chave, valor, pronto])

    const limpar = useCallback(() => {
        window.localStorage.removeItem(PREFIXO + chave)
    }, [chave])

    return [valor, setValor, pronto, limpar] as const
}

export function limparTudoPersistido() {
    Object.keys(window.localStorage)
        .filter((k) => k.startsWith(PREFIXO))
        .forEach((k) => window.localStorage.removeItem(k))
}
