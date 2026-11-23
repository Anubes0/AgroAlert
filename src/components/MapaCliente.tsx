'use client'

import dynamic from 'next/dynamic'

// next/dynamic com ssr: false so pode ser usado dentro de um Client Component.
// Sem isso, o Leaflet quebraria na renderizacao do servidor (nao existe window).
const MapaInterativo = dynamic(() => import('./MapaInterativo'), {
    ssr: false,
    loading: () => (
        <div className="pagina-app">
            <div className="estado">Carregando o mapa...</div>
        </div>
    ),
})

export default MapaInterativo
