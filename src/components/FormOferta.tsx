'use client'

import { useState, type FormEvent } from 'react'
import { ROTULO_CATEGORIA } from '@/data/rotulos'
import { gerarId } from '@/lib/pedidos'
import type { Categoria, Classe, Oferta, TipoColheita, Unidade } from '@/types'

// formulario controlado de criar/editar oferta (painel do produtor)

interface Campos {
    produto: string
    categoria: Categoria
    classe: Classe
    unidade: Unidade
    preco: string
    quantidade: string
    colheita: TipoColheita
    descricao: string
}

type Erros = Partial<Record<keyof Campos, string>>

const UNIDADES: Unidade[] = ['kg', 'un', 'maço', 'bandeja']

function paraCampos(oferta?: Partial<Oferta>): Campos {
    return {
        produto: oferta?.produto ?? '',
        categoria: oferta?.categoria ?? 'folhosas',
        classe: oferta?.classe ?? 'padrao',
        unidade: oferta?.unidade ?? 'kg',
        preco: oferta?.preco ? String(oferta.preco).replace('.', ',') : '',
        quantidade: oferta?.quantidade ? String(oferta.quantidade).replace('.', ',') : '',
        colheita: oferta?.colheita ?? 'semana',
        descricao: oferta?.descricao ?? '',
    }
}

const paraNumero = (texto: string) => parseFloat(texto.replace(',', '.'))

export function validarOferta(c: Campos, vendido: number): Erros {
    const erros: Erros = {}
    const preco = paraNumero(c.preco)
    const quantidade = paraNumero(c.quantidade)

    if (c.produto.trim().length < 3) erros.produto = 'Informe o nome do produto (mínimo 3 letras).'
    if (!Number.isFinite(preco) || preco <= 0) erros.preco = 'Informe um preço maior que zero.'
    else if (preco > 500) erros.preco = 'Preço por unidade muito alto — confira o valor.'
    if (!Number.isFinite(quantidade) || quantidade <= 0) erros.quantidade = 'Informe a quantidade que espera colher.'
    else if (quantidade < vendido) erros.quantidade = `Já foram vendidos ${vendido} ${c.unidade} neste ciclo; a quantidade não pode ser menor.`
    else if (c.unidade !== 'kg' && !Number.isInteger(quantidade)) erros.quantidade = 'Para unidade, maço ou bandeja use número inteiro.'
    if (c.descricao.length > 160) erros.descricao = 'Máximo de 160 caracteres.'
    return erros
}

interface Props {
    produtorId: string
    inicial?: Partial<Oferta>
    vendido?: number
    aoSalvar: (oferta: Oferta) => void
    aoCancelar: () => void
}

export default function FormOferta({ produtorId, inicial, vendido = 0, aoSalvar, aoCancelar }: Props) {
    const [campos, setCampos] = useState<Campos>(() => paraCampos(inicial))
    const [erros, setErros] = useState<Erros>({})
    const editando = Boolean(inicial?.id)

    function mudar<K extends keyof Campos>(chave: K, valor: Campos[K]) {
        setCampos((atual) => ({ ...atual, [chave]: valor }))
        setErros((atual) => ({ ...atual, [chave]: undefined }))
    }

    function enviar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const novosErros = validarOferta(campos, vendido)
        setErros(novosErros)
        if (Object.keys(novosErros).length) return

        aoSalvar({
            id: inicial?.id ?? gerarId('of'),
            produtorId,
            produto: campos.produto.trim(),
            categoria: campos.categoria,
            classe: campos.classe,
            unidade: campos.unidade,
            preco: paraNumero(campos.preco),
            quantidade: paraNumero(campos.quantidade),
            colheita: campos.colheita,
            descricao: campos.descricao.trim(),
        })
    }

    return (
        <form className="caixa" onSubmit={enviar} noValidate style={{ marginBottom: 20 }}>
            <h3>{editando ? 'Editar oferta' : 'Nova oferta da semana'}</h3>

            <div className="grade-campos-2">
                <label className="campo">
                    Produto *
                    <input value={campos.produto} onChange={(e) => mudar('produto', e.target.value)} placeholder="Ex.: Alface americana" aria-invalid={Boolean(erros.produto)} />
                    {erros.produto && <span className="erro-campo">{erros.produto}</span>}
                </label>
                <label className="campo">
                    Categoria
                    <select value={campos.categoria} onChange={(e) => mudar('categoria', e.target.value as Categoria)}>
                        {(Object.keys(ROTULO_CATEGORIA) as Categoria[]).map((c) => (
                            <option key={c} value={c}>{ROTULO_CATEGORIA[c]}</option>
                        ))}
                    </select>
                    <span className="dica-campo">Folhosas e ervas têm 24h de prazo de reclamação; o resto, 48h.</span>
                </label>
                <label className="campo">
                    Preço por unidade (R$) *
                    <input inputMode="decimal" value={campos.preco} onChange={(e) => mudar('preco', e.target.value)} placeholder="Ex.: 4,50" aria-invalid={Boolean(erros.preco)} />
                    {erros.preco && <span className="erro-campo">{erros.preco}</span>}
                </label>
                <label className="campo">
                    Unidade
                    <select value={campos.unidade} onChange={(e) => mudar('unidade', e.target.value as Unidade)}>
                        {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                </label>
                <label className="campo">
                    Quantidade máxima que espera colher *
                    <input inputMode="decimal" value={campos.quantidade} onChange={(e) => mudar('quantidade', e.target.value)} placeholder="Ex.: 40" aria-invalid={Boolean(erros.quantidade)} />
                    {erros.quantidade && <span className="erro-campo">{erros.quantidade}</span>}
                </label>
                <label className="campo">
                    Classe de qualidade
                    <select value={campos.classe} onChange={(e) => mudar('classe', e.target.value as Classe)}>
                        <option value="padrao">Padrão</option>
                        <option value="feio-mas-bom">Feio mas bom (fora de padrão, com desconto)</option>
                    </select>
                </label>
                <label className="campo">
                    Colheita
                    <select value={campos.colheita} onChange={(e) => mudar('colheita', e.target.value as TipoColheita)}>
                        <option value="semana">Colheita da semana</option>
                        <option value="antecipada">Colheita antecipada (alerta de clima)</option>
                    </select>
                </label>
                <label className="campo">
                    Descrição curta
                    <input value={campos.descricao} onChange={(e) => mudar('descricao', e.target.value)} placeholder="Ex.: colhida na sexta de madrugada" maxLength={160} />
                    {erros.descricao && <span className="erro-campo">{erros.descricao}</span>}
                </label>
            </div>

            <div className="acoes">
                <button type="submit" className="btn btn-primario">{editando ? 'Salvar alterações' : 'Publicar oferta'}</button>
                <button type="button" className="btn btn-secundario" onClick={aoCancelar}>Cancelar</button>
            </div>
        </form>
    )
}
