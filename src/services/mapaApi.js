// chamadas as APIs publicas usadas pelo mapa interativo (nenhuma exige chave):
// - Nominatim (OpenStreetMap): geocodificacao, "nome da cidade" -> (lat, lng)
// - Open-Meteo: clima atual e previsao para um ponto (lat, lng)

const URL_NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const URL_OPEN_METEO = 'https://api.open-meteo.com/v1/forecast'

// busca uma cidade/endereco no Brasil e devolve o primeiro resultado
// (ou null se nada for encontrado)
export async function buscarLocal(texto, sinal) {
    const parametros = new URLSearchParams({
        q: texto,
        format: 'jsonv2',
        countrycodes: 'br',
        limit: '1',
        'accept-language': 'pt-BR',
    })

    const resposta = await fetch(`${URL_NOMINATIM}?${parametros}`, { signal: sinal })
    if (!resposta.ok) throw new Error(`Nominatim respondeu ${resposta.status}`)

    const resultados = await resposta.json()
    if (!resultados.length) return null

    const [primeiro] = resultados
    return {
        lat: parseFloat(primeiro.lat),
        lng: parseFloat(primeiro.lon),
        // display_name vem completo ("Campinas, Região Imediata de..., Brasil");
        // os dois primeiros trechos ja bastam pra exibir
        nome: primeiro.display_name.split(',').slice(0, 2).join(',').trim(),
    }
}

// clima atual + previsao de 4 dias para o ponto
export async function buscarClima(lat, lng, sinal) {
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

    const dados = await resposta.json()

    // a API devolve a previsao em arrays paralelos (um por variavel);
    // aqui vira uma lista de objetos, um por dia, mais facil de renderizar
    const previsao = dados.daily.time.map((data, i) => ({
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

// transforma a previsao em alertas pensados para quem produz:
// cada alerta traz o risco e uma recomendacao pratica de escoamento
export function gerarAlertas(clima) {
    const alertas = []

    clima.previsao.forEach((dia) => {
        const quando = formatarDia(dia.data)

        if (dia.minima <= LIMITE_GEADA) {
            alertas.push({
                nivel: dia.minima <= 0 ? 'alto' : 'atencao',
                titulo: 'Risco de geada',
                descricao: `${quando}: mínima de ${Math.round(dia.minima)}°C. Proteja as folhosas e antecipe a colheita do que for sensível.`,
            })
        }

        if (dia.maxima >= LIMITE_CALOR) {
            alertas.push({
                nivel: 'atencao',
                titulo: 'Calor extremo',
                descricao: `${quando}: máxima de ${Math.round(dia.maxima)}°C. Perecíveis estragam mais rápido — priorize a venda no mesmo dia.`,
            })
        }

        if (dia.chuvaMm >= LIMITE_CHUVA_FORTE) {
            alertas.push({
                nivel: 'alto',
                titulo: 'Chuva forte',
                descricao: `${quando}: ${Math.round(dia.chuvaMm)} mm previstos. Estradas de terra podem ficar ruins — combine a entrega antes.`,
            })
        }

        if (dia.ventoMax >= LIMITE_VENTANIA) {
            alertas.push({
                nivel: 'atencao',
                titulo: 'Ventania',
                descricao: `${quando}: rajadas de até ${Math.round(dia.ventoMax)} km/h. Atenção a estufas e frutas no pé.`,
            })
        }
    })

    if (clima.atual.umidade < LIMITE_UMIDADE_BAIXA) {
        alertas.push({
            nivel: 'atencao',
            titulo: 'Umidade baixa',
            descricao: `Agora: ${clima.atual.umidade}% de umidade. Reforce a irrigação e evite colher nas horas mais quentes.`,
        })
    }

    return alertas
}

// codigos WMO usados pela Open-Meteo -> descricao + icone
export function descreverTempo(codigo) {
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

// "2026-10-09" -> "sex., 09"
// (meio-dia evita que o fuso faça a data "voltar" um dia)
export function formatarDia(dataIso) {
    return new Date(`${dataIso}T12:00:00`).toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
    })
}

// distancia em linha reta entre dois pontos (formula de haversine), em km —
// e o mesmo calculo descrito na etapa de "matching" da pagina Funcionamento
export function calcularDistanciaKm(origem, destino) {
    const RAIO_TERRA_KM = 6371
    const paraRad = (graus) => (graus * Math.PI) / 180

    const dLat = paraRad(destino.lat - origem.lat)
    const dLng = paraRad(destino.lng - origem.lng)
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(paraRad(origem.lat)) * Math.cos(paraRad(destino.lat)) * Math.sin(dLng / 2) ** 2

    return 2 * RAIO_TERRA_KM * Math.asin(Math.sqrt(a))
}
