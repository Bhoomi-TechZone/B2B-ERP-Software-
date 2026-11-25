import { useState, useEffect } from 'react'
import departmentService from '../services/departmentService'

/**
 * Custom hook to fetch and manage departments
 * @returns {{ departments: Array, loading: boolean, error: string, refetch: Function }}
 */
export const useDepartments = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDepartments = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await departmentService.getDepartments()
      const list = Array.isArray(data) ? data : (data?.departments || data?.data || [])
      setDepartments(list)
    } catch (err) {
      console.error('Failed to fetch departments:', err)
      setError(err.message || 'Failed to load departments')
      // Don't set fallback - keep empty array to show error state
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  return {
    departments,
    loading,
    error,
    refetch: fetchDepartments
  }
}
