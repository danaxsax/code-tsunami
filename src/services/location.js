const COUNTRY_MAP = {
  'méxico': 'mexico',
  'mexico': 'mexico',
  'argentina': 'argentina',
  'perú': 'peru',
  'peru': 'peru',
  'ecuador': 'ecuador',
}

const files = import.meta.glob('../../agente-tuali/Casos Principales/*.json', { eager: true })
const samples = Object.values(files).map(m => m.default || m)

function pickRandom() {
  return samples.length ? samples[Math.floor(Math.random() * samples.length)] : {}
}

export function detectCountry() {
  const sample = pickRandom()
  const raw = (sample.pais || '').toLowerCase().trim()
  return COUNTRY_MAP[raw] || 'mexico'
}

export function getStoreInfo() {
  const sample = pickRandom()
  return {
    nombre: sample.punto_venta || '',
    direccion: sample.direccion || '',
    pais: sample.pais || 'México',
  }
}
