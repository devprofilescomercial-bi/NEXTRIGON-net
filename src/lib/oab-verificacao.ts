export interface OABResultado {
  encontrado: boolean
  nome?: string
  inscricao?: string
  situacao?: string
  tipo?: string
  uf?: string
  subSeccional?: string
  erro?: string
}

export async function verificarOAB(numero: string, uf: string): Promise<OABResultado> {
  try {
    // Consulta a API pública do CNA (Cadastro Nacional dos Advogados)
    const url = `https://cna.oab.org.br/api/advogado/${numero.replace(/\D/g, "")}/${uf.toUpperCase()}`

    const resp = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; Nextrigon/1.0)",
        "Referer": "https://cna.oab.org.br/",
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!resp.ok) {
      // Fallback: scraping da página HTML do CNA
      return await verificarOABScraping(numero, uf)
    }

    const json = await resp.json()

    if (!json || json.length === 0) {
      return { encontrado: false }
    }

    const adv = Array.isArray(json) ? json[0] : json
    return {
      encontrado: true,
      nome: adv.Nome || adv.nome,
      inscricao: adv.Inscricao || adv.inscricao || numero,
      situacao: adv.Situacao || adv.situacao || "Ativo",
      tipo: adv.TipoInscricao || adv.tipo || "Advogado",
      uf: adv.UF || adv.uf || uf,
      subSeccional: adv.SubSeccional || adv.subSeccional,
    }
  } catch {
    return await verificarOABScraping(numero, uf)
  }
}

async function verificarOABScraping(numero: string, uf: string): Promise<OABResultado> {
  try {
    const params = new URLSearchParams({
      NomeAdvo: "",
      Inscricao: numero.replace(/\D/g, ""),
      Uf: uf.toUpperCase(),
    })

    const resp = await fetch(`https://cna.oab.org.br/Home/Search?${params}`, {
      headers: {
        "Accept": "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0 (compatible; Nextrigon/1.0)",
        "Referer": "https://cna.oab.org.br/",
      },
      signal: AbortSignal.timeout(12000),
    })

    if (!resp.ok) return { encontrado: false, erro: "Serviço OAB indisponível" }

    const html = await resp.text()

    // Sem resultados
    if (html.includes("Nenhum registro encontrado") || html.includes("nenhum resultado")) {
      return { encontrado: false }
    }

    // Extrai nome do resultado
    const nomeMatch = html.match(/class="[^"]*nome[^"]*"[^>]*>\s*([^<]+)\s*</i)
      || html.match(/<td[^>]*>\s*([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇa-záéíóúâêîôûãõç\s]+)\s*<\/td>/i)

    const situacaoMatch = html.match(/Ativo|Suspenso|Cancelado|Licenciado/i)
    const tipoMatch = html.match(/Advogado|Estagiário|Sócio/i)

    if (!nomeMatch) return { encontrado: false }

    return {
      encontrado: true,
      nome: nomeMatch[1].trim(),
      inscricao: numero,
      situacao: situacaoMatch ? situacaoMatch[0] : "Ativo",
      tipo: tipoMatch ? tipoMatch[0] : "Advogado",
      uf: uf.toUpperCase(),
    }
  } catch (err) {
    return { encontrado: false, erro: "Erro ao consultar CNA OAB" }
  }
}
