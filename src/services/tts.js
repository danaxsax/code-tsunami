export async function speak(text, country = 'mexico') {
  try {
    const customerProfile = localStorage.getItem('tuali_customer_profile') || import.meta.env.VITE_CUSTOMER_PROFILE || '1_0012Eplus18'

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, country, customerProfile }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `TTS error ${res.status}`)
    }

    const data = await res.json()
    const audioRes = await fetch(`data:${data.mimeType || 'audio/mpeg'};base64,${data.audio}`)
    const blob = await audioRes.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.onended = () => URL.revokeObjectURL(url)
    await audio.play()
  } catch (err) {
    console.error('[TTS] Failed to speak:', err)
  }
}
