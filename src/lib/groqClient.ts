/**
 * Shared Groq client with automatic key fallback.
 * Rotates through GROQ_API_KEY, GROQ_FALLBACK_KEY_1, GROQ_FALLBACK_KEY_2, and GROQ_API_KEY_BACKUP.
 */

export function getGroqApiKeys(): string[] {
  return [
    process.env.GROQ_API_KEY,
    process.env.GROQ_FALLBACK_KEY_1,
    process.env.GROQ_FALLBACK_KEY_2,
    process.env.GROQ_API_KEY_BACKUP,
  ].filter((k): k is string => !!k && k !== 'dummy-build-key' && k.trim().length > 0)
}

export async function fetchGroqChat(
  body: {
    model?: string
    messages: Array<{ role: string; content: string }>
    max_tokens?: number
    temperature?: number
    stream?: boolean
    response_format?: { type: string }
  },
  modelsToTry: string[] = ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-20b']
): Promise<Response> {
  const keys = getGroqApiKeys()
  if (keys.length === 0) {
    throw new Error('No valid Groq API key found in environment')
  }

  const requestedModel = body.model || 'openai/gpt-oss-120b'
  const modelList = Array.from(new Set([requestedModel, ...modelsToTry]))

  let lastError: Error | null = null

  for (const key of keys) {
    for (const model of modelList) {
      try {
        const payload = { ...body, model }
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
            'User-Agent': 'EduFin-AI/1.0',
          },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          return res
        }

        const errText = await res.text().catch(() => '')
        console.warn(`[Groq] HTTP ${res.status} with model ${model} (key ${key.slice(0, 8)}...): ${errText.slice(0, 150)}`)
        lastError = new Error(`Groq API error (${res.status}): ${errText.slice(0, 200)}`)

        // If rate limit (429) or unauthorized (401), switch to next key immediately
        if (res.status === 429 || res.status === 401) {
          break
        }
      } catch (err: any) {
        lastError = err
        console.warn(`[Groq] Request failed with key ${key.slice(0, 8)}...:`, err?.message || err)
        break
      }
    }
  }

  throw lastError || new Error('All Groq API keys and models failed')
}
