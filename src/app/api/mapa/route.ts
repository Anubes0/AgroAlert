import { associacoes, pontos, produtores } from '@/data/catalogo'

// GET /api/mapa — pontos de retirada, hubs (associacoes) e produtores para o mapa
export async function GET() {
    return Response.json({ pontos, associacoes, produtores })
}
