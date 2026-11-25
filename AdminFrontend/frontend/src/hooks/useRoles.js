import { useState, useEffect } from 'react'
import roleService from '../services/roleService'

/**
 * Custom hook to fetch and manage roles
 * @returns {{ roles: Array, loading: boolean, error: string, refetch: Function }}
 */
export const useRoles = () => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRoles = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await roleService.getRoles()
      const list = Array.isArray(data) ? data : (data?.data || data?.roles || [])
      setRoles(list)
    } catch (err) {
      console.error('Failed to fetch roles:', err)
      setError(err.message || 'Failed to load roles')
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles
  }
}
