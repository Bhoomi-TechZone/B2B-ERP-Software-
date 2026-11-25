import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Returns the current auth context. Will throw a friendly error if used
 * outside of <AuthProvider /> so misuse is caught at dev time.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
