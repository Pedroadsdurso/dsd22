import { type NextRequest, NextResponse } from "next/server"

interface LogEntry {
  cpf: string
  action: string
  data: any
  timestamp: string
}

// In-memory storage for demo purposes
// In production, you'd use a database
const logs: LogEntry[] = []

export async function POST(request: NextRequest) {
  try {
    const logEntry: LogEntry = await request.json()
    logs.push(logEntry)

    console.log(`[CHAT LOG] ${logEntry.cpf} - ${logEntry.action}:`, logEntry.data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving log:", error)
    return NextResponse.json({ success: false, error: "Failed to save log" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ logs })
}
