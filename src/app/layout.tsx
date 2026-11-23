import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BotaoTopo from '@/components/BotaoTopo'
import './globals.css'
import '@/styles/paginas.css'

export const metadata: Metadata = {
    title: {
        default: 'AgroAlert — Venda sua colheita antes que ela vire perda',
        template: '%s · AgroAlert',
    },
    description:
        'Ciclo semanal sob encomenda: produtores familiares de hortifrúti natural colhem só o que foi vendido e entregam em pontos de retirada perto de você.',
    icons: { icon: '/favicon.svg' },
}

// layout raiz do App Router: envolve TODAS as rotas
export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="pt-BR">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <Providers>
                    <Navbar />
                    <main>{children}</main>
                    <Footer />
                    <BotaoTopo />
                </Providers>
            </body>
        </html>
    )
}
