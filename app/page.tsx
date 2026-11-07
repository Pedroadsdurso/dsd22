"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Star, Menu, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function SerasaLimpaNome() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev < 2 ? prev + 1 : 0))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : 2))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-pink-600 text-white px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="lg" className="text-white hover:bg-pink-700 p-3 flex items-center gap-3">
            <Menu className="w-6 h-6" />
            <span className="text-base font-medium">Menu</span>
          </Button>

          <div className="flex-1 flex justify-center">
            <div className="block md:hidden">
              <Image
                src="/limpa-nome-white-logo.svg"
                alt="Serasa Limpa Nome"
                width={120}
                height={36}
                className="w-auto h-9"
              />
            </div>
            <div className="hidden md:block">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Design%20sem%20nome%20%2819%29-f5xxacM5IS5MzMRLZoYSeh3xTTHXDT.png"
                alt="Serasa Limpa Nome"
                width={180}
                height={45}
                className="w-auto h-[62px] my-[-19px]"
              />
            </div>
          </div>

          <Link href="/entrar">
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-pink-700 flex items-center gap-3 px-4 py-3"
            >
              <User className="w-6 h-6" />
              <span className="text-base font-medium">Entrar</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 to-pink-100 px-4 relative overflow-hidden py-0.5">
        <div className="max-w-7xl mx-auto">
          <div className="lg:hidden">
            {/* Mobile Image */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="relative z-10">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_b799797afcc34c618873e57a818b68c3-SY76DmGXIerkAU1uP5EXBGjKGWCoHv.webp"
                  alt="Homem sorrindo segurando celular com ofertas exclusivas"
                  width={300}
                  height={360}
                  className="w-auto max-w-xs h-auto my-3.5 mb-[-52px]"
                />
              </div>

              <div className="absolute top-4 right-4 bg-yellow-400 text-black px-2 py-1 rounded-lg text-xs font-bold shadow-lg z-20">
                VALE BONUS
                <br />
                <span className="text-xs">SERASA</span>
              </div>

              <div className="absolute top-1/3 right-2 bg-white px-2 py-1 rounded-lg text-xs font-semibold shadow-lg z-20 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-pink-600 rounded-full"></div>
                <span>Unifique</span>
              </div>

              <div className="absolute bottom-1/3 right-4 bg-white px-2 py-1 rounded-lg text-xs font-semibold shadow-lg z-20 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Descontos</span>
              </div>
            </div>

            {/* Mobile Content Container */}
            <div className="backdrop-blur-sm rounded-2xl p-6 shadow-lg bg-transparent px-[55px] py-[31px] my-[15px] mx-2.5">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="py-1 rounded-lg inline-block text-black">
                    <h1 className="font-bold text-3xl px-0 mx-[-32px]">Serasa Limpa Nome:</h1>
                  </div>
                  <h2 className="text-pink-600 leading-tight items-stretch tracking-normal text-3xl font-semibold mx-[-32px]">
                    {"Negocie dívidas com até\n 90% de desconto"}
                  </h2>
                  <p className="text-gray-700 leading-relaxed mx-[-31px] text-lg font-light">
                    Encontre ofertas de forma rápida e segura, com opções de parcelamento que facilitam a negociação das
                    suas dívidas e ajudam a limpar o seu nome
                  </p>
                </div>

                <div className="pt-2">
                  <Link href="/entrar">
                    <Button
                      size="lg"
                      className="bg-pink-600 hover:bg-pink-700 text-white px-6 font-semibold shadow-lg hover:shadow-xl transition-all w-full rounded-md text-lg py-[25px]"
                    >
                      Consultar CPF grátis
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-4 md:space-y-6">
                <div className="py-2 md:py-4 rounded-lg inline-block text-black my-[-15px] md:my-[-29px] px-1">
                  <h1 className="font-bold text-2xl md:text-5xl">Serasa Limpa Nome:</h1>
                </div>
                <h2 className="text-xl md:text-3xl lg:text-5xl font-bold text-pink-600 leading-tight my-2.5">
                  Negocie dívidas com até 90% de desconto
                </h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-lg">
                  Encontre ofertas de forma rápida e segura, com opções de parcelamento que facilitam a negociação das
                  suas dívidas e ajudam a limpar o seu nome
                </p>
              </div>

              <div className="space-y-4">
                <Link href="/entrar">
                  <Button
                    size="lg"
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 md:px-8 py-3 md:py-4 font-semibold shadow-lg hover:shadow-xl transition-all rounded-sm text-lg md:text-xl w-full md:w-auto"
                  >
                    Consultar CPF grátis
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="relative z-10">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_b799797afcc34c618873e57a818b68c3-SY76DmGXIerkAU1uP5EXBGjKGWCoHv.webp"
                  alt="Homem sorrindo segurando celular com ofertas exclusivas"
                  width={500}
                  height={600}
                  className="max-w-xs md:max-w-lg w-auto h-auto"
                />
              </div>

              <div className="absolute top-4 md:top-8 right-4 md:right-8 bg-yellow-400 text-black px-2 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm font-bold shadow-lg z-20">
                VALE BONUS
                <br />
                <span className="text-xs">SERASA</span>
              </div>

              <div className="absolute top-1/3 right-2 md:right-4 bg-white px-2 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm font-semibold shadow-lg z-20 flex items-center gap-1 md:gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-600 rounded-full"></div>
                <span className="hidden sm:inline">Unifique seus acordos</span>
                <span className="sm:hidden">Unifique</span>
              </div>

              <div className="absolute bottom-1/3 right-4 md:right-8 bg-white px-2 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm font-semibold shadow-lg z-20 flex items-center gap-1 md:gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                <span className="hidden sm:inline">Descontos exclusivos</span>
                <span className="sm:hidden">Descontos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Updated Stats Section */}
      <section className="bg-white px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="md:text-4xl text-gray-900 mb-4 text-left text-3xl font-light">
              Por que negociar suas dívidas com a Serasa?
            </h2>
          </div>

          {/* Desktop - Static Grid with Mobile Design */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center px-[34px] py-8 bg-gray-100">
              <CardContent className="space-y-6">
                <div className="rounded-full flex items-center justify-center mx-auto bg-transparent mr-0 ml-0 h-[43px] w-[45px]">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_8b6109c960c347da9d7663eafbac8203-Pj3dYgoHjd4qs0GE6ALHPaolXvJzK5.webp"
                    alt="Ofertas exclusivas"
                    width={40}
                    height={40}
                    className="w-10 h-10 text-left ml-[-40px] mb-1.5 mt-2.5"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-left ml-[-12px]">Ofertas exclusivas</h3>
                <p className="text-gray-600 leading-relaxed ml-[-12px] mt-[-20px] items-start text-left">
                  Negocie suas dívidas com até 90% de desconto e condições especiais.
                </p>
                <Button variant="link" className="text-pink-600 p-0 font-semibold text-left text-lg">
                  Saiba Mais →
                </Button>
              </CardContent>
            </Card>

            <Card className="p-8 text-center px-[34px] py-8 bg-gray-100">
              <CardContent className="space-y-6">
                <div className="rounded-full flex items-center justify-center mx-auto bg-transparent mr-0 ml-0 h-[43px] w-[45px]">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_bcba7a98a9be4390bf75feeb79970775-0jnMLgvwV0tRr6MUMOBv63AMMPAzQ5.webp"
                    alt="Confiável e seguro"
                    width={40}
                    height={40}
                    className="w-10 h-10 text-left ml-[-40px] mb-1.5 mt-2.5"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-left ml-[-12px]">Confiável e seguro</h3>
                <p className="text-gray-600 leading-relaxed ml-[-12px] mt-[-20px] items-start text-left">
                  Negocie em poucos minutos, com a segurança que só a Serasa pode oferecer.
                </p>
                <Button variant="link" className="text-pink-600 p-0 font-semibold text-left text-lg">
                  Saiba Mais →
                </Button>
              </CardContent>
            </Card>

            <Card className="p-8 text-center px-[34px] py-8 bg-gray-100">
              <CardContent className="space-y-6">
                <div className="rounded-full flex items-center justify-center mx-auto bg-transparent mr-0 ml-0 h-[43px] w-[45px]">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_d5b4ad59a02b4f76bdc48272b6e2e5c0-bqXpCfTO8NKAJkwvud2fOrjBp49bM0.webp"
                    alt="Gerencie seus acordos"
                    width={40}
                    height={40}
                    className="w-10 h-10 text-left ml-[-40px] mb-1.5 mt-2.5"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-left ml-[-12px]">Gerencie seus acordos</h3>
                <p className="text-gray-600 leading-relaxed ml-[-12px] mt-[-20px] items-start text-left">
                  Emitir a 2ª Via e acompanhar os seus acordos é só com a Serasa.
                </p>
                <Button variant="link" className="text-pink-600 p-0 font-semibold text-left text-lg">
                  Saiba Mais →
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Mobile - Carousel with Fixed Navigation */}
          <div className="md:hidden">
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                <div className="w-full flex-shrink-0 px-4">
                  <Card className="p-8 text-center px-[34px] py-8 bg-gray-100">
                    <CardContent className="space-y-6">
                      <div className="rounded-full flex items-center justify-center mx-auto bg-transparent mr-0 ml-0 h-[43px] w-[45px]">
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_8b6109c960c347da9d7663eafbac8203-Pj3dYgoHjd4qs0GE6ALHPaolXvJzK5.webp"
                          alt="Ofertas exclusivas"
                          width={40}
                          height={40}
                          className="w-10 h-10 text-left ml-[-40px] mb-1.5 mt-2.5"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 text-left ml-[-12px]">Ofertas exclusivas</h3>
                      <p className="text-gray-600 leading-relaxed ml-[-12px] mt-[-20px] items-start text-left">
                        Negocie suas dívidas com até 90% de desconto e condições especiais.
                      </p>
                      <Button variant="link" className="text-pink-600 p-0 font-semibold text-left text-lg">
                        Saiba Mais →
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="w-full flex-shrink-0 px-4">
                  <Card className="p-8 text-center px-[34px] py-8 bg-gray-100">
                    <CardContent className="space-y-6">
                      <div className="rounded-full flex items-center justify-center mx-auto bg-transparent mr-0 ml-0 h-[43px] w-[45px]">
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_bcba7a98a9be4390bf75feeb79970773-95zT3Lhbv0KcVzrLU5EabdFUleAZkv.webp"
                          alt="Confiável e seguro"
                          width={40}
                          height={40}
                          className="w-10 h-10 text-left ml-[-40px] mb-1.5 mt-2.5"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 text-left ml-[-12px]">Confiável e seguro</h3>
                      <p className="text-gray-600 leading-relaxed ml-[-12px] mt-[-20px] items-start text-left">
                        Negocie em poucos minutos, com a segurança que só a Serasa pode oferecer.
                      </p>
                      <Button variant="link" className="text-pink-600 p-0 font-semibold text-left text-lg">
                        Saiba Mais →
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="w-full flex-shrink-0 px-4">
                  <Card className="p-8 text-center px-[34px] py-8 bg-gray-100">
                    <CardContent className="space-y-6">
                      <div className="rounded-full flex items-center justify-center mx-auto bg-transparent mr-0 ml-0 h-[43px] w-[45px]">
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_d5b4ad59a02b4f76bdc48272b6e2e5c0-bqXpCfTO8NKAJkwvud2fOrjBp49bM0.webp"
                          alt="Gerencie seus acordos"
                          width={40}
                          height={40}
                          className="w-10 h-10 text-left ml-[-40px] mb-1.5 mt-2.5"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 text-left ml-[-12px]">
                        Gerencie seus acordos
                      </h3>
                      <p className="text-gray-600 leading-relaxed ml-[-12px] mt-[-20px] items-start text-left">
                        Emitir a 2ª Via e acompanhar os seus acordos é só com a Serasa.
                      </p>
                      <Button variant="link" className="text-pink-600 p-0 font-semibold text-left text-lg">
                        Saiba Mais →
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4 mt-6 text-left ml-[-241px]">
                <button
                  className="p-3 rounded-full hover:bg-pink-700 transition-colors bg-transparent text-black"
                  onClick={prevSlide}
                >
                  ←
                </button>

                <span className="text-lg font-semibold text-gray-700 px-4">{currentSlide + 1}/3</span>

                <button
                  className="p-3 hover:bg-pink-700 transition-colors text-black bg-transparent rounded-full opacity-100"
                  onClick={nextSlide}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}

      {/* How it Works Section */}

      {/* App Section */}

      {/* Info Section */}

      {/* App Mockup Section */}

      {/* Benefits Section */}

      {/* Partner Logos */}
      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-gray-900 mb-8 text-left text-3xl tracking-normal font-medium md:hidden">
            São mais de 1.400 parceiros com ofertas exclusivas pra você
          </h3>

          <div className="md:hidden flex justify-center mb-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-j2VPwGKYiAAuGateJLwSHrtV8pTzFN.png"
              alt="Parceiros Serasa - Claro, C6 Bank, Itaú, Santander, Vivo, Carrefour e outros"
              width={320}
              height={240}
              className="w-full max-w-sm h-auto"
            />
          </div>

          <div className="hidden md:grid md:grid-cols-2 gap-12 items-center bg-slate-100 rounded-xl">
            <div className="space-y-6">
              <h3 className="text-gray-900 text-4xl font-medium leading-tight ml-20">
                São mais de 1.400 parceiros com ofertas exclusivas pra você
              </h3>
              <Button className="bg-pink-600 hover:bg-pink-700 text-white px-8 rounded-lg mr-[7px] ml-[188px] mt-[72px] text-2xl py-7">
                Ver todos os parceiros
              </Button>
            </div>

            <div className="flex justify-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zMft1YxMnouXUuwA2R8rf2ErjtdZfB.png"
                alt="Parceiros Serasa - Claro, C6 Bank, Itaú, Santander, Vivo, Carrefour, Recovery, Inter, Ativos e outros"
                width={500}
                height={400}
                className="w-full max-w-lg h-auto"
              />
            </div>
          </div>

          <div className="text-center mt-8 md:hidden">
            <Button className="border-pink-600 hover:bg-pink-50 bg-pink-600 text-white py-[27px] text-xl mx-0 px-[59px]">
              Ver todos os parceiros
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-gray-900 text-3xl ml-[-1px] font-normal mt-0 mb-[34px] text-left">
              Com a palavra, nossos clientes do nome limpo
            </h2>
          </div>

          {/* Desktop - Static Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center px-[34px] py-8 bg-gray-100">
              <CardContent className="space-y-6">
                <div className="rounded-full flex items-center justify-center mx-auto bg-transparent mr-0 ml-0 h-[43px] w-[45px]">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_073aaccda1bd41ceb6e71e188145b359-ySKj3duWOMACIT9QydZozuYralEYGR.webp"
                    alt="Amanda Camila"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover text-left ml-[-40px] mb-1.5 mt-2.5"
                  />
                </div>
                <div className="flex space-x-1 text-left ml-[-12px]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed ml-[-12px] mt-[-20px] items-start text-left">
                  "Consegui negociar minhas dívidas com 85% de desconto. Foi muito fácil e rápido pelo app."
                </p>
                <div className="text-left ml-[-12px]">
                  <div className="font-semibold text-gray-900">Amanda Camila</div>
                  <div className="text-sm text-gray-600">São Paulo, SP</div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8 text-center px-[34px] py-8 bg-gray-100">
              <CardContent className="space-y-6">
                <div className="rounded-full flex items-center justify-center mx-auto bg-transparent mr-0 ml-0 h-[43px] w-[45px]">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_bd78d4309ee249728c9129dcd3dda573-95zT3Lhbv0KcVzrLU5EabdFUleAZkv.webp"
                    alt="Roberto Pereira"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover text-left ml-[-40px] mb-1.5 mt-2.5"
                  />
                </div>
                <div className="flex space-x-1 text-left ml-[-12px]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed ml-[-12px] mt-[-20px] items-start text-left">
                  "Excelente serviço! Limpei meu nome em poucos dias e consegui voltar a ter crédito no mercado."
                </p>
                <div className="text-left ml-[-12px]">
                  <div className="font-semibold text-gray-900">Roberto Pereira</div>
                  <div className="text-sm text-gray-600">Rio de Janeiro, RJ</div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8 text-center px-[34px] py-8 bg-gray-100">
              <CardContent className="space-y-6">
                <div className="rounded-full flex items-center justify-center mx-auto bg-transparent mr-0 ml-0 h-[43px] w-[45px]">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_f906b7ac60fa42fcbf00ff6bfdf966ae-SqJrVx8EgkylhFaN7URXziUZZO3DVo.webp"
                    alt="Ana Santos"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover text-left ml-[-40px] mb-1.5 mt-2.5"
                  />
                </div>
                <div className="flex space-x-1 text-left ml-[-12px]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed ml-[-12px] mt-[-20px] items-start text-left">
                  "Recomendo para todos! O atendimento é ótimo e as condições de pagamento são muito boas."
                </p>
                <div className="text-left ml-[-12px]">
                  <div className="font-semibold text-gray-900">Ana Santos</div>
                  <div className="text-sm text-gray-600">Belo Horizonte, MG</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile - Carousel */}
          <div className="md:hidden">
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                <div className="w-full flex-shrink-0 px-4">
                  <Card className="p-8 text-center px-[34px] py-8 bg-gray-100">
                    <CardContent className="space-y-6">
                      <div className="rounded-full flex items-center justify-center mx-auto bg-transparent mr-0 ml-0 h-[43px] w-[45px]">
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_073aaccda1bd41ceb6e71e188145b359-ySKj3duWOMACIT9QydZozuYralEYGR.webp"
                          alt="Amanda Camila"
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover text-left ml-[-40px] mb-1.5 mt-2.5"
                        />
                      </div>
                      <div className="flex space-x-1 text-left ml-[-12px]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-600 leading-relaxed ml-[-12px] mt-[-20px] items-start text-left">
                        "Consegui negociar minhas dívidas com 85% de desconto. Foi muito fácil e rápido pelo app."
                      </p>
                      <div className="text-left ml-[-12px]">
                        <div className="font-semibold text-gray-900">Amanda Camila</div>
                        <div className="text-sm text-gray-600">São Paulo, SP</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="w-full flex-shrink-0 px-4">
                  <Card className="p-8 text-center px-[34px] py-8 bg-gray-100">
                    <CardContent className="space-y-6">
                      <div className="rounded-full flex items-center justify-center mx-auto bg-transparent mr-0 ml-0 h-[43px] w-[45px]">
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_bd78d4309ee249728c9129dcd3dda573-95zT3Lhbv0KcVzrLU5EabdFUleAZkv.webp"
                          alt="Roberto Pereira"
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover text-left ml-[-40px] mb-1.5 mt-2.5"
                        />
                      </div>
                      <div className="flex space-x-1 text-left ml-[-12px]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-600 leading-relaxed ml-[-12px] mt-[-20px] items-start text-left">
                        "Excelente serviço! Limpei meu nome em poucos dias e consegui voltar a ter crédito no mercado."
                      </p>
                      <div className="text-left ml-[-12px]">
                        <div className="font-semibold text-gray-900">Roberto Pereira</div>
                        <div className="text-sm text-gray-600">Rio de Janeiro, RJ</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="w-full flex-shrink-0 px-4">
                  <Card className="p-8 text-center px-[34px] py-8 bg-gray-100">
                    <CardContent className="space-y-6">
                      <div className="rounded-full flex items-center justify-center mx-auto bg-transparent mr-0 ml-0 h-[43px] w-[45px]">
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets_b212bb18f00a40869a6cd42f77cbeefc_f906b7ac60fa42fcbf00ff6bfdf966ae-SqJrVx8EgkylhFaN7URXziUZZO3DVo.webp"
                          alt="Ana Santos"
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover text-left ml-[-40px] mb-1.5 mt-2.5"
                        />
                      </div>
                      <div className="flex space-x-1 text-left ml-[-12px]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-600 leading-relaxed ml-[-12px] mt-[-20px] items-start text-left">
                        "Recomendo para todos! O atendimento é ótimo e as condições de pagamento são muito boas."
                      </p>
                      <div className="text-left ml-[-12px]">
                        <div className="font-semibold text-gray-900">Ana Santos</div>
                        <div className="text-sm text-gray-600">Belo Horizonte, MG</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4 mt-6 text-left ml-[-241px]">
                <button
                  className="p-3 rounded-full hover:bg-pink-700 transition-colors bg-transparent text-black"
                  onClick={prevSlide}
                >
                  ←
                </button>

                <span className="text-lg font-semibold text-gray-700 px-4">{currentSlide + 1}/3</span>

                <button
                  className="p-3 hover:bg-pink-700 transition-colors text-black bg-transparent rounded-full opacity-100"
                  onClick={nextSlide}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="bg-pink-50 px-4 py-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl text-gray-900 font-normal text-left">Aplicativo Serasa</h2>
            <p className="text-gray-700">
              Baixe o app e tenha acesso completo aos serviços Serasa na palma da sua mão. Consulte seu CPF, negocie
              dívidas e muito mais.
            </p>
            <div className="flex space-x-4">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white">Baixar na App Store</Button>
              <Button className="bg-pink-600 hover:bg-pink-700 text-white">Baixar no Google Play</Button>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg inline-block">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Link_pra_pagina_principal_da_Wikipedia-PT_em_codigo_QR_b.svg-TrcPCB0O2qYEGFuciTCwQE39YlmHQK.png"
                alt="QR Code para download do app"
                width={200}
                height={200}
              />
              <p className="text-sm text-gray-600 mt-4">Escaneie o QR Code e baixe o app</p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services */}

      {/* Blog Section */}

      {/* FAQ Section */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl text-gray-900 mb-12 text-left font-semibold">Tire suas dúvidas sobre o Limpa Nome</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                question: "Como eu consulto o meu CPF e descubro quais são as minhas dívidas?",
                answer:
                  "Você pode consultar seu CPF gratuitamente pelo app Serasa ou pelo site. Basta fazer seu cadastro e ter acesso completo ao seu relatório de crédito.",
              },
              {
                question: "Posso negociar no Feirão Limpa Nome mesmo se não tiver dívidas?",
                answer:
                  "O Feirão Limpa Nome é específico para quem tem dívidas registradas nos órgãos de proteção ao crédito. Se você não tem dívidas, pode aproveitar outros serviços Serasa.",
              },
              {
                question: "Qual o valor de desconto que posso conseguir no Limpa Nome?",
                answer:
                  "Os descontos podem chegar até 90%, dependendo do credor e das condições da negociação. Cada caso é analisado individualmente.",
              },
              {
                question: "Como eu sei se o pagamento foi reconhecido pelo credor?",
                answer:
                  "Após o pagamento, você recebe uma confirmação e pode acompanhar o status da quitação pelo app ou site Serasa.",
              },
              {
                question: "Posso parcelar o pagamento das minhas dívidas no Limpa Nome?",
                answer:
                  "Sim, muitas ofertas permitem parcelamento. As condições variam conforme o credor e o valor da dívida.",
              },
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-gray-900">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-700">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="text-center mt-8">
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">Ver mais perguntas frequentes</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">O que você precisa</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    Consultar CPF
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Limpar nome
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cartão de crédito
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Empréstimo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Todos os sites</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    Serasa
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    SPC
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cadastro Positivo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Atendimento</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    Central de ajuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Fale conosco
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Ouvidoria
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Sobre a Serasa</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    Quem somos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Trabalhe conosco
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Imprensa
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-sm text-gray-400">
            <p>© 2024 Serasa S.A. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
