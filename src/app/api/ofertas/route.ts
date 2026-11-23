import { ofertasIniciais } from '@/data/catalogo'

// GET /api/ofertas — "back-end" do prototipo: devolve as ofertas da semana.
// Num sistema real, consultaria o banco (Supabase) filtrando o ciclo atual.
export async function GET() {
    // pequena latencia artificial para o estado de "carregando" aparecer na vitrine
    await new Promise((resolver) => setTimeout(resolver, 400))
    return Response.json(ofertasIniciais)
}
