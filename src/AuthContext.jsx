import { createContext, useEffect, useMemo, useState } from 'react'

export const AuthContext = createContext({
  role: null,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null)

  useEffect(() => {
    const storedRole = localStorage.getItem('questchain-role')
    if (storedRole) {
      setRole(storedRole)
    }
  }, [])

  const login = (newRole) => {
    setRole(newRole)
    localStorage.setItem('questchain-role', newRole)
  }

  const logout = () => {
    setRole(null)
    localStorage.removeItem('questchain-role')
  }

  const value = useMemo(
    () => ({ role, login, logout }),
    [role],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
