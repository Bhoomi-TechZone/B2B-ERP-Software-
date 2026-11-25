import { memo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { FileText, Lock, Unlock, ArrowRight, Calendar, ArrowLeft } from 'lucide-react'
import PayrollRunStepper from '../components/PayrollRunStepper'
import Step1LockPeriod from '../components/Step1LockPeriod'
import Step2Earnings from '../components/Step2Earnings'
import Step3Statutory from '../components/Step3Statutory'
import Step4Voluntary from '../components/Step4Voluntary'
import Step5Preview from '../components/Step5Preview'
import Step6Approval from '../components/Step6Approval'
import Step7Generate from '../components/Step7Generate'
import Step8Finalise from '../components/Step8Finalise'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const InRunPayroll = memo(() => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(2) // Defaulting to 2 for previewing UI
  const [loading, setLoading] = useState(true)
  
  const [payrollData, setPayrollData] = useState({
    period: { 
      month: new Date().getMonth(), 
      year: new Date().getFullYear(), 
      isLocked: true, // Assuming locked to see step 2
      runId: null
    },
    employees: [],
    allEmployees: [],
    summary: { totalEmployees: 0, totalGross: 0, totalDeductions: 0, totalNet: 0 }
  })
  const [attendanceSynced, setAttendanceSynced] = useState(false);

  const getAuthData = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token')
    if (!token) throw new Error('No authentication token found. Please login again.')
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]))
      const tenantId = tokenData.tid
      if (!tenantId) throw new Error('Tenant ID not found in token')
      return { token, tenantId }
    } catch (error) {
      throw new Error('Invalid authentication token. Please login again.')
    }
  }

  // Fetch employees and configurations
  const loadData = async (month, year) => {
    try {
      setLoading(true)
      const { token } = getAuthData()
      const apiUrl = import.meta.env.VITE_API_URL || 'https://b2bbackend.btplsoft.com'
      
      const previewResponse = await fetch(
        `${apiUrl}/api/payroll/preview/IN?month=${month + 1}&year=${year}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      if (!previewResponse.ok) throw new Error('Failed to fetch payroll preview')
      const previewData = await previewResponse.json()
      
      const mappedEmployees = (previewData.employees || []).map(emp => {
        return {
          id: emp.employee_id,
          name: emp.name,
          employeeId: emp.employee_id?.substring(0, 8).toUpperCase(),
          department: emp.dept || 'Other',
          designation: emp.designation || '—',
          status: 'active',
          basic: emp.basic || 0,
          hra: emp.hra || 0,
          allowances: emp.allowances || 0,
          bonus: emp.bonus || 0,
          overtime: emp.overtime || 0,
          gross: emp.gross || 0,
          pf: emp.pf || 0,
          esi: emp.esi || 0,
          pt: emp.prof_tax || 0,
          tds: emp.tds || 0,
          loan: emp.loan || 0,
          advance: emp.advance || 0,
          other: emp.other || 0,
          deductions: emp.deductions || 0,
          netPay: emp.net_pay || 0,
          attendance: null
        }
      })
      
      setPayrollData(prev => ({
        ...prev,
        period: { ...prev.period, month, year },
        employees: mappedEmployees,
        allEmployees: mappedEmployees,
        summary: {
          totalEmployees: previewData.employee_count,
          totalGross: previewData.total_gross,
          totalDeductions: previewData.total_deductions,
          totalNet: previewData.total_net
        }
      }))
      
      // Auto sync if we just loaded
      await syncAttendance(mappedEmployees.map(e => e.id), month + 1, year, token, apiUrl)
      
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const syncAttendance = async (empIds, monthStr, year, token, apiUrl, previewOnly = false) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/payroll/attendance-sync/IN?month=${monthStr}&year=${year}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_ids: empIds })
        }
      )
      
      if (response.ok) {
        const result = await response.json()
        const attData = result.data || []
        
        if (!previewOnly) {
          setPayrollData(prev => {
            const updatedAll = prev.allEmployees.map(emp => {
              const match = attData.find(a => a.employee_id === emp.id)
              return match ? { ...emp, attendance: match } : emp
            })
            return { ...prev, allEmployees: updatedAll, employees: updatedAll }
          })
          setAttendanceSynced(true)
        }
        return attData
      } else {
        throw new Error('Sync failed')
      }
    } catch(err) {
      console.error("Attendance Sync failed", err)
      throw err
    }
  }

  const handleSyncAttendance = async (empIds, previewOnly = false) => {
    const { token } = getAuthData()
    const apiUrl = import.meta.env.VITE_API_URL || 'https://b2bbackend.btplsoft.com'
    return await syncAttendance(empIds, payrollData.period.month + 1, payrollData.period.year, token, apiUrl, previewOnly)
  }

  useEffect(() => {
    loadData(payrollData.period.month, payrollData.period.year)
  }, [])

  const handlePeriodChange = (e) => {
    const val = parseInt(e.target.value)
    loadData(val, payrollData.period.year)
  }

  const handleLockToggle = async () => {
    try {
      const { token } = getAuthData()
      const apiUrl = import.meta.env.VITE_API_URL || 'https://b2bbackend.btplsoft.com'
      const { month, year, isLocked } = payrollData.period
      const newLockState = !isLocked
      
      const empIds = payrollData.allEmployees.map(e => e.id)
      
      const response = await fetch(
        `${apiUrl}/api/payroll/lock-period/IN?month=${month + 1}&year=${year}&lock=${newLockState}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_ids: empIds })
        }
      )
      
      if (response.ok) {
        setPayrollData(prev => ({
          ...prev,
          period: { ...prev.period, isLocked: newLockState }
        }))
        if (newLockState && !attendanceSynced) {
           await syncAttendance(empIds, month + 1, year, token, apiUrl)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateEarnings = async (empId, data) => {
    try {
      const { token } = getAuthData()
      const apiUrl = import.meta.env.VITE_API_URL || 'https://b2bbackend.btplsoft.com'
      const response = await fetch(`${apiUrl}/api/payroll/earnings/${empId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        await loadData(payrollData.period.month, payrollData.period.year)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleApprove = async () => {
    try {
      const { token } = getAuthData()
      const apiUrl = import.meta.env.VITE_API_URL || 'https://b2bbackend.btplsoft.com'
      const { month, year } = payrollData.period
      await fetch(
        `${apiUrl}/api/payroll/approve/IN?month=${month + 1}&year=${year}`,
        { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }
      )
    } catch (e) { console.error(e) }
  }

  const handleGeneratePayslips = async () => {
    try {
      const { token } = getAuthData()
      const apiUrl = import.meta.env.VITE_API_URL || 'https://b2bbackend.btplsoft.com'
      const { month, year } = payrollData.period
      await fetch(`${apiUrl}/api/payroll/run`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region: 'IN', month: month + 1, year: year, employee_ids: payrollData.employees.map(e => e.id)
        })
      })
      alert("Payslips Generated!")
    } catch (error) { console.error(error) }
  }

  const handleMarkAsPaid = async () => {
    try {
      const { token } = getAuthData()
      const apiUrl = import.meta.env.VITE_API_URL || 'https://b2bbackend.btplsoft.com'
      const { month, year } = payrollData.period
      await fetch(
        `${apiUrl}/api/payroll/mark-paid/IN?month=${month + 1}&year=${year}`,
        { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }
      )
    } catch(e) { console.error(e) }
  }

  const handleNext = () => setCurrentStep(prev => Math.min(8, prev + 1))
  const handlePrev = () => setCurrentStep(prev => Math.max(1, prev - 1))

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1LockPeriod
            period={payrollData.period}
            onLock={() => handleLockToggle()}
            onPeriodChange={() => {}}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <Step2Earnings
            employees={payrollData.employees}
            summary={payrollData.summary}
            onUpdate={handleUpdateEarnings}
            onNext={handleNext}
            onPrev={handlePrev}
            onSyncAttendance={handleSyncAttendance}
          />
        )
      case 3:
        return <Step3Statutory employees={payrollData.employees} onUpdate={handleUpdateEarnings} onNext={handleNext} onPrev={handlePrev} />
      case 4:
        return <Step4Voluntary employees={payrollData.employees} onUpdate={handleUpdateEarnings} onNext={handleNext} onPrev={handlePrev} />
      case 5:
        return <Step5Preview employees={payrollData.employees} onNext={handleNext} onPrev={handlePrev} />
      case 6:
        return <Step6Approval summary={payrollData.summary} onApprove={handleApprove} onReject={() => setCurrentStep(1)} onNext={handleNext} onPrev={handlePrev} />
      case 7:
        return <Step7Generate employees={payrollData.employees} period={payrollData.period} onGeneratePayslips={handleGeneratePayslips} onDownloadBankFile={() => {}} onNext={handleNext} onPrev={handlePrev} />
      case 8:
        return <Step8Finalise onMarkAsPaid={handleMarkAsPaid} onSendNotifications={() => {}} onComplete={() => navigate('/payroll/in/payslips')} onPrev={handlePrev} />
      default:
        return null
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#F8FAFC]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/payroll/in')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Run Payroll - {MONTHS[payrollData.period.month]} {payrollData.period.year}</h1>
              {payrollData.period.isLocked && (
                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 border border-green-200 shadow-sm">
                  <Lock className="w-3.5 h-3.5"/> Locked
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Review attendance, earnings, deductions and process payroll</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={payrollData.period.month}
              onChange={handlePeriodChange}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m} {payrollData.period.year}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleLockToggle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all border ${
              payrollData.period.isLocked 
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            }`}
          >
            {payrollData.period.isLocked ? <Unlock className="w-4 h-4"/> : <Lock className="w-4 h-4"/>}
            {payrollData.period.isLocked ? 'Unlock Cycle' : 'Lock Cycle'}
          </button>
          
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        <PayrollRunStepper
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step <= currentStep) setCurrentStep(step)
          }}
        />
        
        <div className="px-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                <p className="text-sm font-medium text-slate-600">Loading payroll data...</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
})

InRunPayroll.displayName = 'InRunPayroll'
export default InRunPayroll
