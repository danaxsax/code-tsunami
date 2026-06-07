const API_BASE = 'https://api.elevenlabs.io/v1'

const VOICES = {
  mexico:     import.meta.env.VITE_ELEVENLABS_VOICE_MEXICO  || '21m00Tcm4TlvDq8ikWAM',
  argentina:  import.meta.env.VITE_ELEVENLABS_VOICE_ARGENTINA || '21m00Tcm4TlvDq8ikWAM',
  peru:       import.meta.env.VITE_ELEVENLABS_VOICE_PERU    || '21m00Tcm4TlvDq8ikWAM',
  ecuador:    import.meta.env.VITE_ELEVENLABS_VOICE_ECUADOR || '21m00Tcm4TlvDq8ikWAM',
}

const API_KEY = import.meta.env.VITE_ELEVENLABS_KEY

export async function speak(text, country = 'mexico') {
  if (!API_KEY) {
    console.warn('[TTS] No VITE_ELEVENLABS_KEY in .env')
    return
  }

  const voiceId = VOICES[country] || VOICES.mexico

  try {
    const res = await fetch(`${API_BASE}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.7,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`ElevenLabs error ${res.status}: ${err}`)
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.onended = () => URL.revokeObjectURL(url)
    await audio.play()
  } catch (err) {
    console.error('[TTS] Failed to speak:', err)
  }
}
