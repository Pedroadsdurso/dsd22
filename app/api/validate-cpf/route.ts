import { type NextRequest, NextResponse } from "next/server"

const AMNESIA_TOKEN = "76418167-38e2-46aa-acf1-51ed15b4db9f"

function isValidCPF(cleanCpf: string): boolean {
  if (cleanCpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cleanCpf.charAt(i), 10) * (10 - i)
  }
  let remainder = 11 - (sum % 11)
  const digit1 = remainder >= 10 ? 0 : remainder

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cleanCpf.charAt(i), 10) * (11 - i)
  }
  remainder = 11 - (sum % 11)
  const digit2 = remainder >= 10 ? 0 : remainder

  return (
    Number.parseInt(cleanCpf.charAt(9), 10) === digit1 &&
    Number.parseInt(cleanCpf.charAt(10), 10) === digit2
  )
}

export async function POST(request: NextRequest) {
  try {
    const { cpf } = await request.json()

    if (!cpf) {
      return NextResponse.json({ valid: false, message: "CPF é obrigatório" }, { status: 400 })
    }

    const cleanCpf = String(cpf).replace(/\D/g, "")

    if (!isValidCPF(cleanCpf)) {
      return NextResponse.json({ valid: false, message: "CPF inválido. Verifique os dígitos." }, { status: 400 })
    }

    // Try fast Amnesia lookup to pre-fetch name
    let userData = null
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2500)
      const apiUrl = `https://api.amnesiatecnologia.lat/?token=${AMNESIA_TOKEN}&cpf=${cleanCpf}`
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
        cache: "no-store",
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const json = await res.json()
        const dados = json?.DADOS
        if (dados && dados.nome && String(dados.nome).trim()) {
          userData = {
            nome: String(dados.nome).trim(),
            nascimento: dados.data_nascimento ? String(dados.data_nascimento).trim() : "",
            mae: dados.nome_mae ? String(dados.nome_mae).trim() : "",
            sexo: dados.sexo ? String(dados.sexo).trim() : "",
          }
        }
      }
    } catch {
      // Non-blocking lookup failure
    }

    return NextResponse.json({
      valid: true,
      message: "CPF válido",
      user: userData,
    })
  } catch (error) {
    return NextResponse.json({ valid: false, message: "Erro ao validar CPF" }, { status: 500 })
  }
}
