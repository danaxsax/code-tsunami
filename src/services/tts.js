let currentAudio = null
let currentAudioUrl = null
let currentResolve = null
let audioRunId = 0

function base64ToBlob(base64, mimeType = 'audio/mpeg') {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new Blob([bytes], { type: mimeType })
}

export function stopSpeaking() {
  audioRunId += 1
  if (!currentAudio) return

  currentAudio.pause()
  currentAudio.currentTime = 0
  currentAudio = null
  currentResolve?.()
  currentResolve = null

  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl)
    currentAudioUrl = null
  }
}

export async function speak(text, country = 'mexico') {
  stopSpeaking()
  const runId = audioRunId

  try {
    const customerProfile = localStorage.getItem('tuali_customer_profile') || import.meta.env.VITE_CUSTOMER_PROFILE || '1_0012Eplus18'

    const base = import.meta.env.VITE_API_URL || ''
    const res = await fetch(`${base}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, country, customerProfile }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `TTS error ${res.status}`)
    }

    const data = await res.json()
    if (runId !== audioRunId) return

    if (!data.audio) throw new Error('La respuesta de voz no trajo audio')

    const blob = base64ToBlob(data.audio, data.mimeType || 'audio/mpeg')
    if (runId !== audioRunId) return

    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    currentAudio = audio
    currentAudioUrl = url

    await new Promise((resolve, reject) => {
      currentResolve = resolve
      audio.onended = () => {
        if (currentAudio === audio) {
          currentAudio = null
          currentAudioUrl = null
          currentResolve = null
        }
        URL.revokeObjectURL(url)
        resolve()
      }
      audio.onerror = () => {
        if (currentAudio === audio) {
          currentAudio = null
          currentAudioUrl = null
          currentResolve = null
        }
        URL.revokeObjectURL(url)
        reject(new Error('No se pudo reproducir el audio'))
      }
      audio.play().catch(reject)
    })
  } catch (err) {
    console.error('[TTS] Failed to speak:', err)
    throw err
  }
}
