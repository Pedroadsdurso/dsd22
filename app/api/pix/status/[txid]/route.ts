import { type NextRequest, NextResponse } from "next/server"

const BOSSPAY_PUBLIC_KEY = process.env.BOSSPAY_PUBLIC_KEY || ""
const BOSSPAY_SECRET_KEY = process.env.BOSSPAY_SECRET_KEY || ""

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ txid: string }> }
) {
  try {
    const { txid } = await params

    const response = await fetch(`https://app.bosspay.cash/api/v1/pix/${txid}`, {
      method: "GET",
      headers: {
        "X-Public-Key": BOSSPAY_PUBLIC_KEY,
        "X-Secret-Key": BOSSPAY_SECRET_KEY,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || "Erro ao consultar status" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      status: data.status,
      txid: data.txid,
      amount_cents: data.amount_cents,
      paid_at: data.paid_at,
    })
  } catch (error) {
    console.error("Error checking PIX status:", error)
    return NextResponse.json(
      { success: false, error: "Erro interno ao consultar status" },
      { status: 500 }
    )
  }
}
