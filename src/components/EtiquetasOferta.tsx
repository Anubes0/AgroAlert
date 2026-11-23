import { ROTULO_CLASSE, SELOS } from '@/data/rotulos'
import type { Oferta, Selo } from '@/types'

export function SeloEtiqueta({ selo, longo = false }: { selo: Selo; longo?: boolean }) {
    const info = SELOS[selo]
    return (
        <span className={`etiqueta selo-${selo}`} title={info.descricao}>
            {selo === 'transicao' ? '🌱' : '✔'} {longo ? info.rotulo : info.curto}
        </span>
    )
}

// selo do produtor + classe de qualidade + colheita antecipada
export default function EtiquetasOferta({ oferta, selo }: { oferta: Oferta; selo: Selo }) {
    return (
        <div className="etiquetas">
            <SeloEtiqueta selo={selo} />
            {oferta.classe === 'feio-mas-bom' && <span className="etiqueta etiqueta-feio">{ROTULO_CLASSE['feio-mas-bom']}</span>}
            {oferta.colheita === 'antecipada' && <span className="etiqueta etiqueta-antecipada">⏩ Colheita antecipada</span>}
        </div>
    )
}
