import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY
let genAI: GoogleGenerativeAI | null = null
let model: any = null

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey)
    model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" })
  } catch (e) {
    console.warn("Failed to initialize Gemini:", e)
  }
}

const REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 20_000)
const MAX_BACKOFF_MS = 5_000

export async function generateWithGemini(prompt: string): Promise<string> {
  if (!model) {
    return ""
  }

  const maxRetries = 2
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const result = await model.generateContent(prompt, { signal: controller.signal })
      const response = await result.response
      const text = response.text()
      return text.trim()
    } catch (error: any) {
      const status = error?.response?.status || error?.status
      if (error?.name === "AbortError") {
        console.warn(`Gemini request timed out after ${REQUEST_TIMEOUT_MS}ms`)
        return ""
      }
      if (status === 429 && attempt < maxRetries - 1) {
        const retryDelay = error?.response?.data?.error?.details?.[0]?.retryDelay || `${(attempt + 1) * 2000}ms`
        const ms = Math.min(parseInt(retryDelay) || 2000, MAX_BACKOFF_MS)
        console.warn(`Gemini rate limited, retrying in ${ms}ms...`)
        await new Promise(resolve => setTimeout(resolve, ms))
        continue
      }
      console.error("Gemini API error:", error)
      return ""
    } finally {
      clearTimeout(timer)
    }
  }
  return ""
}
