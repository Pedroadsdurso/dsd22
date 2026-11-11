import { type NextRequest, NextResponse } from "next/server"

const BOSSPAY_PUBLIC_KEY = process.env.BOSSPAY_PUBLIC_KEY || ""
const BOSSPAY_SECRET_KEY = process.env.BOSSPAY_SECRET_KEY || ""

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount_cents, customer_name, customer_document, customer_phone, customer_email, description, external_id } = body

    if (!amount_cents || !customer_name || !customer_document || !customer_phone) {
      return NextResponse.json(
        { success: false, error: "Parâmetros obrigatórios faltando" },
        { status: 400 }
      )
    }

    const requestBody = {
      amount_cents,
      customer_name,
      customer_document: customer_document.replace(/\D/g, ""),
      customer_phone: customer_phone.replace(/\D/g, ""),
      customer_email: customer_email || undefined,
      description: description || "Acordo Feirao 2026",
      external_id,
      expiration: 3600,
    }

    const response = await fetch("https://app.bosspay.cash/api/v1/pix/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${BOSSPAY_SECRET_KEY}`,
        "X-Public-Key": BOSSPAY_PUBLIC_KEY,
        "X-Secret-Key": BOSSPAY_SECRET_KEY,
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { success: false, error: data.message || data.error || "Erro ao gerar PIX" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      txid: data.txid,
      amount_cents: data.amount_cents,
      pix: {
        copia_e_cola: data.pix.copia_e_cola,
        qr_code_base64: data.pix.qr_code_base64,
        expiration: data.pix.expiration,
      },
      customer: data.customer,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno ao processar pagamento" },
      { status: 500 }
    )
  }
}
