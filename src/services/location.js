import sample from '../../volumen_sample.json'

export function detectCountry() {
  return sample['país'] || 'mexico'
}

export function getStoreInfo() {
  return {
    nombre: sample.punto_venta || '',
    direccion: sample.direccion || '',
    pais: sample['país'] || 'mexico',
  }
}
