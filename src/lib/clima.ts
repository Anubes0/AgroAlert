// Chamadas as APIs publicas (nenhuma exige chave) — reaproveitadas da Fase 6:
// - Nominatim (OpenStreetMap): geocodificacao, "nome da cidade" -> (lat, lng)
// - Open-Meteo: clima atual e previsao para um ponto (lat, lng)

const URL_NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const URL_OPEN_METEO = 'https://api.open-meteo.com/v1/forecast'

export interface Coordenada {
    lat: number
    lng: number
}

export interface LocalEncontrado extends Coordenada {
    nome: string
}

export interface DiaPrevisao {
    data: string
    codigo: number
    maxima: number
    minima: number
    chuvaMm: number
    chanceChuva: number | null
    ventoMax: number
}

export interface Clima {
    atual: {
        temperatura: number
        umidade: number
        chuvaMm: number
        vento: number
        codigo: number
    }
    previsao: DiaPrevisao[]
}

export type NivelAlerta = 'alto' | 'atencao'

export interface AlertaClima {
    nivel: NivelAlerta
    titulo: string
    descricao: string
    // o que o produtor deve fazer no ciclo semanal
    acao: 'antecipar' | 'reduzir' | 'proteger'
}

// formato cru da resposta do Nominatim (so os campos usados)
interface RespostaNominatim {
    lat: string
    lon: string
    display_name: string
}

// formato cru da resposta da Open-Meteo (arrays paralelos por variavel)
interface RespostaOpenMeteo {
    current: {
        temperature_2m: number
        relative_humidity_2m: number
        precipitation: number
        weather_code: number
        wind_speed_10m: number
    }
    daily: {
        time: string[]
        weather_code: number[]
        temperature_2m_max: number[]
        temperature_2m_min: number[]
        precipitation_sum: number[]
        precipitation_probability_max: (number | null)[]
        wind_speed_10m_max: number[]
    }
}

// busca uma cidade/endereco no Brasil e devolve o primeiro resultado (ou null)
export async function buscarLocal(texto: string, sinal?: AbortSignal): Promise<LocalEncontrado | null> {
    const parametros = new URLSearchParams({
        q: texto,
        format: 'jsonv2',
        countrycodes: 'br',
        limit: '1',
        'accept-language': 'pt-BR',
    })

    const resposta = await fetch(`${URL_NOMINATIM}?${parametros}`, { signal: sinal })
    if (!resposta.ok) throw new Error(`Nominatim respondeu ${resposta.status}`)

    const resultados: RespostaNominatim[] = await resposta.json()
    if (!resultados.length) return null

    const [primeiro] = resultados
    return {
        lat: parseFloat(primeiro.lat),
        lng: parseFloat(primeiro.lon),
        nome: primeiro.display_name.split(',').slice(0, 2).join(',').trim(),
    }
}

// clima atual + previsao de 4 dias para o ponto
export async function buscarClima(lat: number, lng: number, sinal?: AbortSignal): Promise<Clima> {
    const parametros = new URLSearchParams({
        latitude: lat.toFixed(4),
        longitude: lng.toFixed(4),
        current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
        timezone: 'auto',
        forecast_days: '4',
    })

    const resposta = await fetch(`${URL_OPEN_METEO}?${parametros}`, { signal: sinal })
    if (!resposta.ok) throw new Error(`Open-Meteo respondeu ${resposta.status}`)

    const dados: RespostaOpenMeteo = await resposta.json()

    // a API devolve arrays paralelos; aqui vira uma lista de objetos, um por dia
    const previsao: DiaPrevisao[] = dados.daily.time.map((data, i) => ({
        data,
        codigo: dados.daily.weather_code[i],
        maxima: dados.daily.temperature_2m_max[i],
        minima: dados.daily.temperature_2m_min[i],
        chuvaMm: dados.daily.precipitation_sum[i],
        chanceChuva: dados.daily.precipitation_probability_max[i],
        ventoMax: dados.daily.wind_speed_10m_max[i],
    }))

    return {
        atual: {
            temperatura: dados.current.temperature_2m,
            umidade: dados.current.relative_humidity_2m,
            chuvaMm: dados.current.precipitation,
            vento: dados.current.wind_speed_10m,
            codigo: dados.current.weather_code,
        },
        previsao,
    }
}

// limites usados para gerar os alertas agricolas a partir da previsao
const LIMITE_GEADA = 3 // °C de minima
const LIMITE_CALOR = 35 // °C de maxima
const LIMITE_CHUVA_FORTE = 30 // mm no dia
const LIMITE_VENTANIA = 50 // km/h de rajada maxima
const LIMITE_UMIDADE_BAIXA = 30 // % de umidade relativa

// transforma a previsao em alertas pensados para o ciclo semanal:
// cada alerta diz o risco e o que fazer com a oferta da semana
export function gerarAlertas(clima: Clima): AlertaClima[] {
    const alertas: AlertaClima[] = []

    clima.previsao.forEach((dia) => {
        const quando = formatarDia(dia.data)

        if (dia.minima <= LIMITE_GEADA) {
            alertas.push({
                nivel: dia.minima <= 0 ? 'alto' : 'atencao',
                titulo: 'Risco de geada',
                descricao: `${quando}: mínima de ${Math.round(dia.minima)}°C. Antecipe a colheita das folhosas e publique como "colheita antecipada" antes da perda.`,
                acao: 'antecipar',
            })
        }

        if (dia.maxima >= LIMITE_CALOR) {
            alertas.push({
                nivel: 'atencao',
                titulo: 'Calor extremo',
                descricao: `${quando}: máxima de ${Math.round(dia.maxima)}°C. Colha de madrugada e mantenha as caixas à sombra até a rota de sábado.`,
                acao: 'proteger',
            })
        }

        if (dia.chuvaMm >= LIMITE_CHUVA_FORTE) {
            alertas.push({
                nivel: 'alto',
                titulo: 'Chuva forte',
                descricao: `${quando}: ${Math.round(dia.chuvaMm)} mm previstos. Pode faltar produto — reduza a quantidade prometida para não gerar estornos.`,
                acao: 'reduzir',
            })
        }

        if (dia.ventoMax >= LIMITE_VENTANIA) {
            alertas.push({
                nivel: 'atencao',
                titulo: 'Ventania',
                descricao: `${quando}: rajadas de até ${Math.round(dia.ventoMax)} km/h. Frutas podem cair do pé — ofereça o excedente como "Feio mas bom".`,
                acao: 'antecipar',
            })
        }
    })

    if (clima.atual.umidade < LIMITE_UMIDADE_BAIXA) {
        alertas.push({
            nivel: 'atencao',
            titulo: 'Umidade baixa',
            descricao: `Agora: ${clima.atual.umidade}% de umidade. Reforce a irrigação e evite colher nas horas mais quentes.`,
            acao: 'proteger',
        })
    }

    return alertas
}

// codigos WMO usados pela Open-Meteo -> descricao + icone
export function descreverTempo(codigo: number): { texto: string; icone: string } {
    if (codigo === 0) return { texto: 'Céu limpo', icone: '☀️' }
    if (codigo <= 2) return { texto: 'Parcialmente nublado', icone: '⛅' }
    if (codigo === 3) return { texto: 'Nublado', icone: '☁️' }
    if (codigo <= 48) return { texto: 'Neblina', icone: '🌫️' }
    if (codigo <= 57) return { texto: 'Garoa', icone: '🌦️' }
    if (codigo <= 67) return { texto: 'Chuva', icone: '🌧️' }
    if (codigo <= 77) return { texto: 'Neve', icone: '❄️' }
    if (codigo <= 82) return { texto: 'Pancadas de chuva', icone: '🌧️' }
    if (codigo <= 86) return { texto: 'Neve', icone: '❄️' }
    return { texto: 'Tempestade', icone: '⛈️' }
}

// "2026-10-09" -> "sex., 09" (meio-dia evita que o fuso faca a data "voltar" um dia)
export function formatarDia(dataIso: string): string {
    return new Date(`${dataIso}T12:00:00`).toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
    })
}

// distancia em linha reta entre dois pontos (formula de haversine), em km
export function calcularDistanciaKm(origem: Coordenada, destino: Coordenada): number {
    const RAIO_TERRA_KM = 6371
    const paraRad = (graus: number) => (graus * Math.PI) / 180

    const dLat = paraRad(destino.lat - origem.lat)
    const dLng = paraRad(destino.lng - origem.lng)
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(paraRad(origem.lat)) * Math.cos(paraRad(destino.lat)) * Math.sin(dLng / 2) ** 2

    return 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(a))
}

export function formatarKm(valor: number): string {
    return `${valor.toFixed(1).replace('.', ',')} km`
}
