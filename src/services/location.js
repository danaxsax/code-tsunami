const COUNTRIES = [
  { code: 'mexico',    label: 'México',    timezone: 'America/Mexico_City' },
  { code: 'argentina', label: 'Argentina',  timezone: 'America/Argentina/Buenos_Aires' },
  { code: 'peru',      label: 'Perú',       timezone: 'America/Lima' },
  { code: 'ecuador',   label: 'Ecuador',    timezone: 'America/Guayaquil' },
]

export function detectCountry() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const match = COUNTRIES.find(c => c.timezone === tz)
  return match ? match.code : 'mexico'
}
