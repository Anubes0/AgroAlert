'use client'

import { useEffect, useState } from 'react'
import { buscarClima, descreverTempo, formatarDia, gerarAlertas, type AlertaClima, type Clima } from '@/lib/clima'
import type { Produtor } from '@/types'

type Estado = { status: 'carregando' } | { status: 'erro' } | { status: 'ok'; clima: Clima }

const ROTULO_ACAO: Record<AlertaClima['acao'], string> = {
    antecipar: 'Publicar colheita antecipada',
    reduzir: 'Revisar quantidades prometidas',
    proteger: 'Ver dicas de manejo',
}

// useEffect + fetch na Open-Meteo com as coordenadas do sitio do produtor;
// cada alerta vira uma acao concreta no ciclo semanal
export default function AlertaClimaProdutor({
    produtor,
    aoAgir,
}: {
    produtor: Produtor
    aoAgir: (acao: AlertaClima['acao']) => void
}) {
    const [estado, setEstado] = useState<Estado>({ status: 'carregando' })
    const [tentativa, setTentativa] = useState(0)

    useEffect(() => {
        const controle = new AbortController()
        buscarClima(produtor.lat, produtor.lng, controle.signal)
            .then((clima) => setEstado({ status: 'ok', clima }))
            .catch((erro: Error) => {
                if (erro.name !== 'AbortError') setEstado({ status: 'erro' })
            })
        return () => controle.abort()
    }, [produtor.lat, produtor.lng, tentativa])

    if (estado.status === 'carregando') {
        return <div className="caixa"><p className="texto-fraco">Consultando a previsão para {produtor.cidade} na Open-Meteo...</p></div>
    }

    if (estado.status === 'erro') {
        return (
            <div className="estado estado-erro" role="alert">
                <p>Não foi possível consultar a previsão agora.</p>
                <button type="button" className="btn btn-secundario" onClick={() => {
                    setEstado({ status: 'carregando' })
                    setTentativa((t) => t + 1)
                }}>Tentar de novo</button>
            </div>
        )
    }

    const { clima } = estado
    const alertas = gerarAlertas(clima)
    const atual = descreverTempo(clima.atual.codigo)

    return (
        <div className="pilha">
            <div className="caixa">
                <h3>Previsão para o {produtor.sitio} ({produtor.cidade})</h3>
                <p className="texto-fraco">
                    Agora: {atual.icone} {Math.round(clima.atual.temperatura)}°C, {atual.texto.toLowerCase()} · umidade {clima.atual.umidade}% · vento{' '}
                    {Math.round(clima.atual.vento)} km/h
                </p>
                <div className="grade-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', marginTop: 14 }}>
                    {clima.previsao.map((dia) => {
                        const tempo = descreverTempo(dia.codigo)
                        return (
                            <div className="numero" key={dia.data} title={tempo.texto}>
                                <span>{formatarDia(dia.data)}</span>
                                <b>{tempo.icone} {Math.round(dia.maxima)}°</b>
                                <span>mín. {Math.round(dia.minima)}° · 💧{dia.chanceChuva ?? 0}%</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {alertas.length ? (
                alertas.map((alerta, i) => (
                    <div className={`aviso aviso-${alerta.nivel}`} key={`${alerta.titulo}-${i}`}>
                        <strong>{alerta.nivel === 'alto' ? '⛔' : '⚠'} {alerta.titulo}</strong>
                        <p>{alerta.descricao}</p>
                        <div className="acoes">
                            <button type="button" className="btn btn-secundario btn-pequeno" onClick={() => aoAgir(alerta.acao)}>
                                {ROTULO_ACAO[alerta.acao]} →
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="aviso aviso-ok">
                    <strong>✓ Sem riscos climáticos nos próximos 4 dias.</strong>
                    <p>Pode prometer a colheita normal da semana.</p>
                    <div className="acoes">
                        <button type="button" className="btn btn-secundario btn-pequeno" onClick={() => aoAgir('antecipar')}>
                            Simular: publicar colheita antecipada →
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
