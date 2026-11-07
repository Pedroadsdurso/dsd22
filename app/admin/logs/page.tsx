"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface LogEntry {
  cpf: string
  action: string
  data: any
  timestamp: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedCpf, setSelectedCpf] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/logs")
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const uniqueCpfs = [...new Set(logs.map((log) => log.cpf))]
  const filteredLogs = selectedCpf ? logs.filter((log) => log.cpf === selectedCpf) : logs

  const getActionColor = (action: string) => {
    if (action.includes("button_clicked")) return "bg-blue-100 text-blue-800"
    if (action === "chat_started") return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Painel de Logs do Chatbot</h1>
          <p className="text-gray-600">Acompanhe o fluxo de cada cliente em tempo real</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* CPF Filter Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="font-semibold mb-4">Filtrar por CPF</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCpf("")}
                  className={`w-full text-left p-2 rounded text-sm ${
                    !selectedCpf ? "bg-pink-100 text-pink-800" : "hover:bg-gray-100"
                  }`}
                >
                  Todos os CPFs ({logs.length})
                </button>
                {uniqueCpfs.map((cpf) => {
                  const cpfLogs = logs.filter((log) => log.cpf === cpf)
                  return (
                    <button
                      key={cpf}
                      onClick={() => setSelectedCpf(cpf)}
                      className={`w-full text-left p-2 rounded text-sm ${
                        selectedCpf === cpf ? "bg-pink-100 text-pink-800" : "hover:bg-gray-100"
                      }`}
                    >
                      {cpf} ({cpfLogs.length})
                    </button>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Logs Display */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">{selectedCpf ? `Logs para CPF: ${selectedCpf}` : "Todos os Logs"}</h2>
                <div className="text-sm text-gray-500">{filteredLogs.length} registros</div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredLogs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum log encontrado</p>
                  ) : (
                    filteredLogs
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((log, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-gray-600">{log.cpf}</span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}
                              >
                                {log.action}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          {log.data && (
                            <div className="bg-gray-50 rounded p-2 mt-2">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
