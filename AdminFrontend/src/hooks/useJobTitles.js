import { useState, useEffect } from 'react'
import jobTitleService from '../services/jobTitleService'

/**
 * Custom hook to fetch and manage job titles
 * @returns {{ jobTitles: Array, loading: boolean, error: string, refetch: Function }}
 */
export const useJobTitles = () => {
  const [jobTitles, setJobTitles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchJobTitles = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await jobTitleService.getJobTitles()
      const list = Array.isArray(data) ? data : (data?.job_titles || data?.data || [])
      setJobTitles(list)
    } catch (err) {
      console.error('Failed to fetch job titles:', err)
      setError(err.message || 'Failed to load job titles')
      setJobTitles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobTitles()
  }, [])

  return {
    jobTitles,
    loading,
    error,
    refetch: fetchJobTitles
  }
}
