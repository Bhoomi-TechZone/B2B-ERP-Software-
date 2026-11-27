import { memo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { API_BASE_URL } from '../../../config/api'
import PayrollRunStepper from '../components/PayrollRunStepper'
import Step1LockPeriod from '../components/Step1LockPeriod'
import Step2Earnings from '../components/Step2Earnings'
import Step3Statutory from '../components/Step3Statutory'
import Step4Voluntary from '../components/Step4Voluntary'
import Step5Preview from '../components/Step5Preview'
import Step6Approval from '../components/Step6Approval'
import Step7Generate from '../components/Step7Generate'
import Step8Finalise from '../components/Step8Finalise'

const InRunPayroll = memo(() => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [payrollData, setPayrollData] = useState({
    period: { month: 'April', year: 2026, isLocked: false },
    employees: [],
    summary: { totalEmployees: 0, totalGross: 0, totalDeductions: 0, totalNet: 0 }
  })

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        
        // Fetch all employees
        const empResponse = await fetch(`${API_BASE_URL}/employees/?per_page=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!empResponse.ok) throw new Error('Failed to fetch employees')
        const empData = await empResponse.json()
        
        // Fetch payroll configs for US
        const configResponse = await fetch(`${API_BASE_URL}/payroll/config/US`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        const configs = configResponse.ok ? await configResponse.json() : []
        
        // Map employees with their payroll data
        const mappedEmployees = empData.employees.map(emp => {
          const config = configs.find(c => c.employee_id === emp.id)
          
          // Calculate salary components (US specific)
          const grossSalary = config?.gross_salary || 0
          const gross = grossSalary
          
          // Calculate deductions (US specific)
          const federalTax = Math.round(gross * 0.22) // 22% federal tax
          const stateTax = Math.round(gross * 0.05) // 5% state tax (varies by state)
          const socialSecurity = Math.round(gross * 0.062) // 6.2% social security
          const medicare = Math.round(gross * 0.0145) // 1.45% medicare
          const k401 = Math.round(gross * (config?.k401_rate || 0.05)) // 401k contribution
          const healthIns = config?.health_ins || 250 // Health insurance
          
          const totalDeductions = federalTax + stateTax + socialSecurity + medicare + k401 + healthIns
          const netPay = gross - totalDeductions
          
          return {
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            employeeId: emp.employee_number,
            grossSalary,
            gross,
            federalTax,
            stateTax,
            socialSecurity,
            medicare,
            k401,
            healthIns,
            deductions: totalDeductions,
            netPay,
            bankAccount: emp.custom_fields_json?.bank_account || null,
            salarySpike: false
          }
        })
        
        // Calculate summary
        const totalGross = mappedEmployees.reduce((sum, emp) => sum + emp.gross, 0)
        const totalDeductions = mappedEmployees.reduce((sum, emp) => sum + emp.deductions, 0)
        const totalNet = mappedEmployees.reduce((sum, emp) => sum + emp.netPay, 0)
        
        setPayrollData({
          period: { month: 'April', year: 2026, isLocked: false },
          employees: mappedEmployees,
          summary: {
            totalEmployees: mappedEmployees.length,
            totalGross,
            totalDeductions,
            totalNet
          }
        })
      } catch (error) {
        console.error('Error fetching payroll data:', error)
        // Fallback to empty state
        setPayrollData({
          period: { month: 'April', year: 2026, isLocked: false },
          employees: [],
          summary: { totalEmployees: 0, totalGross: 0, totalDeductions: 0, totalNet: 0 }
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchEmployees()
  }, [])

  const handleLockPeriod = async (locked) => {
    setPayrollData({
      ...payrollData,
      period: { ...payrollData.period, isLocked: locked, lockTimestamp: locked ? new Date().toISOString() : null }
    })
  }

  const handleUpdateEarnings = async (empId, data) => {
    try {
      const token = localStorage.getItem('token')
      
      // Update earnings via API
      const response = await fetch(`${API_BASE_URL}/payroll/earnings/${empId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error('Failed to update earnings')
      
      // Recalculate deductions
      const basic = data.basic || 0
      const hra = data.hra || 0
      const bonus = data.bonus || 0
      const overtime = data.overtime || 0
      const gross = basic + hra + bonus + overtime
      
      const pf = Math.round(basic * 0.12)
      const esi = gross <= 21000 ? Math.round(gross * 0.0325) : 0
      const pt = gross > 10000 ? 200 : 0
      const tds = gross > 50000 ? Math.round(gross * 0.1) : 0
      
      const updatedEmployees = payrollData.employees.map(emp => {
        if (emp.id === empId) {
          const totalDeductions = pf + esi + pt + tds + (emp.loan || 0) + (emp.advance || 0) + (emp.other || 0)
          return {
            ...emp,
            ...data,
            gross,
            pf,
            esi,
            pt,
            tds,
            deductions: totalDeductions,
            netPay: gross - totalDeductions
          }
        }
        return emp
      })
      
      // Recalculate summary
      const totalGross = updatedEmployees.reduce((sum, emp) => sum + emp.gross, 0)
      const totalDeductions = updatedEmployees.reduce((sum, emp) => sum + emp.deductions, 0)
      
      setPayrollData({
        ...payrollData,
        employees: updatedEmployees,
        summary: {
          totalEmployees: updatedEmployees.length,
          totalGross,
          totalDeductions,
          totalNet: totalGross - totalDeductions
        }
      })
    } catch (error) {
      console.error('Error updating earnings:', error)
      alert('Failed to update earnings. Please try again.')
    }
  }

  const handleApprove = async () => {
    console.log('Payroll approved')
  }

  const handleReject = async () => {
    console.log('Payroll rejected')
    setCurrentStep(1)
  }

  const handleGeneratePayslips = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Payslips generated')
  }

  const handleDownloadBankFile = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Bank file downloaded')
  }

  const handleMarkAsPaid = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Marked as paid')
  }

  const handleSendNotifications = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Notifications sent')
  }

  const handleComplete = () => {
    navigate('/payroll/in/payslips')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1LockPeriod
            period={payrollData.period}
            onLock={handleLockPeriod}
            onNext={() => setCurrentStep(2)}
          />
        )
      case 2:
        return (
          <Step2Earnings
            employees={payrollData.employees}
            onUpdate={handleUpdateEarnings}
            onNext={() => setCurrentStep(3)}
          />
        )
      case 3:
        return (
          <Step3Statutory
            employees={payrollData.employees}
            onNext={() => setCurrentStep(4)}
          />
        )
      case 4:
        return (
          <Step4Voluntary
            employees={payrollData.employees}
            onNext={() => setCurrentStep(5)}
          />
        )
      case 5:
        return (
          <Step5Preview
            employees={payrollData.employees}
            onNext={() => setCurrentStep(6)}
          />
        )
      case 6:
        return (
          <Step6Approval
            summary={payrollData.summary}
            onApprove={handleApprove}
            onReject={handleReject}
            onNext={() => setCurrentStep(7)}
          />
        )
      case 7:
        return (
          <Step7Generate
            onGeneratePayslips={handleGeneratePayslips}
            onDownloadBankFile={handleDownloadBankFile}
            onNext={() => setCurrentStep(8)}
          />
        )
      case 8:
        return (
          <Step8Finalise
            onMarkAsPaid={handleMarkAsPaid}
            onSendNotifications={handleSendNotifications}
            onComplete={handleComplete}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#F7F8FA]">
      {/* Stepper */}
      <PayrollRunStepper
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step <= currentStep) setCurrentStep(step)
        }}
      />

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              <p className="text-sm text-slate-600">Loading payroll data...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
})

InRunPayroll.displayName = 'InRunPayroll'
export default InRunPayroll
