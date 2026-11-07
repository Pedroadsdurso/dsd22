import { type NextRequest, NextResponse } from "next/server"

const AMNESIA_TOKEN = "76418167-38e2-46aa-acf1-51ed15b4db9f"

function formatBirthDate(dateStr: string): string {
  if (!dateStr) return ""
  const clean = dateStr.trim()
  // If already DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
    return clean
  }
  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [year, month, day] = clean.split("-")
    return `${day}/${month}/${year}`
  }
  // If 8 consecutive digits YYYYMMDD or DDMMYYYY
  if (/^\d{8}$/.test(clean)) {
    if (Number(clean.substring(0, 4)) > 1900) {
      return `${clean.substring(6, 8)}/${clean.substring(4, 6)}/${clean.substring(0, 4)}`
    }
    return `${clean.substring(0, 2)}/${clean.substring(2, 4)}/${clean.substring(4, 8)}`
  }
  return clean
}

function formatGender(sexo: string): string {
  if (!sexo) return ""
  const upper = sexo.trim().toUpperCase()
  if (upper === "M" || upper.startsWith("MASC")) return "Masculino"
  if (upper === "F" || upper.startsWith("FEM")) return "Feminino"
  return sexo
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const cpf = searchParams.get("cpf")

  if (!cpf) {
    return NextResponse.json({ error: "CPF is required" }, { status: 400 })
  }

  const cleanCpf = cpf.replace(/\D/g, "")
  if (cleanCpf.length !== 11) {
    return NextResponse.json({ error: "Invalid CPF format" }, { status: 400 })
  }

  const paramCity = searchParams.get("cidade") || searchParams.get("city")
  let locationCity = paramCity || "Fortaleza"

  if (!paramCity) {
    try {
      const locationController = new AbortController()
      const locTimeout = setTimeout(() => locationController.abort(), 2000)
      const locationResponse = await fetch("https://ipwho.is/", {
        signal: locationController.signal,
        cache: "no-store",
      })
      clearTimeout(locTimeout)
      if (locationResponse.ok) {
        const locationData = await locationResponse.json()
        if (locationData && locationData.city) {
          locationCity = locationData.city
        }
      }
    } catch {
      // Fallback
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const apiUrl = `https://api.amnesiatecnologia.lat/?token=${AMNESIA_TOKEN}&cpf=${encodeURIComponent(cleanCpf)}`
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    })
    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      const dados = data?.DADOS || {}
      const nome = dados.nome ? String(dados.nome).trim() : ""

      if (nome) {
        return NextResponse.json({
          success: true,
          data: {
            nome: nome,
            nascimento: formatBirthDate(String(dados.data_nascimento || "")),
            mae: dados.nome_mae ? String(dados.nome_mae).trim() : "",
            sexo: formatGender(String(dados.sexo || "")),
            cidade: locationCity,
          },
        })
      }
    }
  } catch (error) {
    console.error("[API Amnesia] Error querying CPF:", error)
  }

  // Fallback if API fails or returns empty name
  return NextResponse.json({
    success: false,
    data: {
      nome: "Cliente",
      nascimento: "",
      mae: "",
      sexo: "",
      cidade: locationCity,
    },
    error: "External API unreachable or data empty",
  })
}
