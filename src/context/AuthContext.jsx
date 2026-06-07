import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'tuali_customer_profile'

export const STORE_NAMES = {
  '1_0012Eplus18': 'Distribuidora La Victoria',
  '1_00004Eplus18': 'Abarrotes El Ranchito',
  '3_87064Eplus17': 'Mini Super Don José',
  volumen_sample: 'Mega Bodega del Sur',
  ocasional_sample: 'La Esquina de Doña Mary',
}

export const PROFILE_LABELS = {
  '1_0012Eplus18': 'VIP',
  '1_00004Eplus18': 'Nicho',
  '3_87064Eplus17': 'Recurrente',
  volumen_sample: 'Volumen',
  ocasional_sample: 'Ocasional',
}

export const PROFILE_COUNTRIES = {
  '1_0012Eplus18': 'México',
  '1_00004Eplus18': 'Ecuador',
  '3_87064Eplus17': 'Argentina',
  volumen_sample: 'México',
  ocasional_sample: 'Argentina',
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [profileKey, setProfileKey] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || ''
  })

  const isLoggedIn = !!profileKey
  const storeName = profileKey ? STORE_NAMES[profileKey] || 'Mi Tienda' : ''
  const profileLabel = profileKey ? PROFILE_LABELS[profileKey] || '' : ''
  const country = profileKey ? PROFILE_COUNTRIES[profileKey] || '' : ''

  const login = useCallback((key) => {
    localStorage.setItem(STORAGE_KEY, key)
    setProfileKey(key)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setProfileKey('')
  }, [])

  const value = useMemo(() => ({
    profileKey,
    isLoggedIn,
    storeName,
    profileLabel,
    country,
    login,
    logout,
  }), [profileKey, isLoggedIn, storeName, profileLabel, country, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
