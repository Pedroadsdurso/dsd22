"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShieldCheck, CheckCircle2, ArrowRight, Lock, Zap } from "lucide-react"

function PresellContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleContinue = () => {
    const params = searchParams ? searchParams.toString() : ""
    const target = params ? `/?${params}` : "/"
    router.push(target)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-gray-800">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-pink-600/30">
              F
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">
              Feirão 2026
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Portal Ativo
          </span>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pink-700 bg-pink-50 px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5 text-pink-600" />
            Consulta Oficial Liberada
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              Consulte condições especiais com até 99% de desconto
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Verifique pendências cadastrais, propostas ativas e regularize sua situação com condições facilitadas no Feirão 2026.
            </p>
          </div>

          {/* Key Points */}
          <div className="space-y-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-700 font-medium">
                Consulta gratuita, sigilosa e 100% digital
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-700 font-medium">
                Descontos de até 99% para liquidação imediata
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-gray-700 font-medium">
                Baixa de restrições em até 5 dias úteis após quitação
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleContinue}
              className="w-full py-4 h-14 text-base sm:text-lg font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/30 rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
            >
              <span>Continuar</span>
              <ArrowRight className="w-5 h-5" />
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Ambiente criptografado e seguro</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 space-y-1">
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-gray-400" />
          <span>Feirão de Negociação 2026 · Todos os direitos reservados</span>
        </div>
      </footer>
    </div>
  )
}

export default function PresellPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PresellContent />
    </Suspense>
  )
}
