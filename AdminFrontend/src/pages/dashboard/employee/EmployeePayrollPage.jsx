import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Banknote, Receipt, DollarSign, Wallet, FileText, Download, 
  ChevronRight, Calendar, ArrowUpRight, Eye, MoreVertical, 
  Plus, ExternalLink, HelpCircle, Loader2, CreditCard, Percent, X
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import employeeSelfService from '../../../services/employeeSelfService'
import { useAuth } from '../../../hooks/useAuth'

export default function EmployeePayrollPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('slips')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState('2026')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedSlip, setSelectedSlip] = useState(null)
  const [profile, setProfile] = useState(null)
  const [newClaimModal, setNewClaimModal] = useState(false)
  const [claimData, setClaimData] = useState({
    expenseType: 'Travel Expense',
    amount: '',
    description: ''
  })
  const [isEditingTax, setIsEditingTax] = useState(false)
  const [taxInput, setTaxInput] = useState({
    panNumber: '',
    taxRegime: 'New Tax Regime (Section 115BAC)'
  })

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        const payrollRes = await employeeSelfService.getPayroll()
        const payrollData = payrollRes.data || payrollRes
        setData(payrollData)
        if (payrollData.payslips && payrollData.payslips.length > 0) {
          setSelectedSlip(payrollData.payslips[0])
        }
        
        const profileRes = await employeeSelfService.getProfile()
        setProfile(profileRes.data || profileRes)
      } catch (err) {
        console.error("Failed to load payroll or profile details:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAllData()
  }, [])

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '0';
    return Number(val).toLocaleString('en-IN');
  }

  const downloadPayslipPdf = (slip) => {
    try {
      const doc = new jsPDF()
      
      // Page frame border
      doc.setDrawColor(226, 232, 240)
      doc.rect(10, 10, 190, 277)
      
      // Header Banner background
      doc.setFillColor(37, 99, 235) // Primary Blue
      doc.rect(10, 10, 190, 25, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(18)
      doc.text('WorkMatrix1', 20, 26)
      
      doc.setFontSize(10)
      doc.setFont('Helvetica', 'normal')
      doc.text('PAYSLIP FOR THE MONTH OF ' + slip.month.toUpperCase(), 120, 26)
      
      // Body settings
      doc.setTextColor(30, 41, 59)
      
      // 1. Employee Details Section
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('EMPLOYEE DETAILS', 20, 48)
      
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.5)
      doc.line(20, 50, 190, 50)
      
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(9)
      doc.text('Employee Name:', 20, 58)
      doc.setFont('Helvetica', 'bold')
      doc.text(`${profile?.first_name || user?.name || 'Rahul'} ${profile?.last_name || 'Sharma'}`, 50, 58)
      
      doc.setFont('Helvetica', 'normal')
      doc.text('Employee ID:', 20, 65)
      doc.setFont('Helvetica', 'bold')
      doc.text(profile?.employee_number || 'EMP-00101', 50, 65)
      
      doc.setFont('Helvetica', 'normal')
      doc.text('Department:', 20, 72)
      doc.setFont('Helvetica', 'bold')
      doc.text(profile?.department_name || 'Engineering', 50, 72)
      
      doc.setFont('Helvetica', 'normal')
      doc.text('Designation:', 110, 58)
      doc.setFont('Helvetica', 'bold')
      doc.text(profile?.job_title || 'Software Engineer', 140, 58)
      
      doc.setFont('Helvetica', 'normal')
      doc.text('Pay Period:', 110, 65)
      doc.setFont('Helvetica', 'bold')
      doc.text(slip.pay_period || '01 Jun - 30 Jun 2026', 140, 65)
      
      doc.setFont('Helvetica', 'normal')
      doc.text('Payment Mode:', 110, 72)
      doc.setFont('Helvetica', 'bold')
      doc.text('Bank Transfer', 140, 72)
      
      // 2. Salary Components Table Section
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('SALARY BREAKDOWN', 20, 88)
      doc.line(20, 90, 190, 90)
      
      // Table Header row background
      doc.setFillColor(248, 250, 252)
      doc.rect(20, 93, 170, 8, 'F')
      doc.setFontSize(9)
      doc.text('EARNINGS', 25, 98)
      doc.text('AMOUNT (INR)', 75, 98)
      doc.text('DEDUCTIONS', 115, 98)
      doc.text('AMOUNT (INR)', 160, 98)
      
      // Component Values
      const basic = slip.components?.basic || data?.salary_structure?.basic || 0
      const hra = slip.components?.hra || data?.salary_structure?.hra || 0
      const spec = slip.components?.allowances || slip.components?.special_allowance || data?.salary_structure?.special_allowance || 0
      const pf = slip.components?.pf || slip.components?.provident_fund || data?.salary_structure?.provident_fund || 0
      const pt = slip.components?.prof_tax || slip.components?.professional_tax || data?.salary_structure?.professional_tax || 0
      const tds = slip.components?.tds || data?.salary_structure?.tds || 0
      
      doc.setFont('Helvetica', 'normal')
      doc.text('Basic Salary', 25, 110)
      doc.text(`Rs. ${formatCurrency(basic)}`, 75, 110)
      doc.text('Provident Fund (PF)', 115, 110)
      doc.text(`Rs. ${formatCurrency(pf)}`, 160, 110)
      
      doc.text('House Rent Allowance (HRA)', 25, 118)
      doc.text(`Rs. ${formatCurrency(hra)}`, 75, 118)
      doc.text('Professional Tax (PT)', 115, 118)
      doc.text(`Rs. ${formatCurrency(pt)}`, 160, 118)
      
      doc.text('Special Allowance', 25, 126)
      doc.text(`Rs. ${formatCurrency(spec)}`, 75, 126)
      doc.text('Income Tax (TDS)', 115, 126)
      doc.text(`Rs. ${formatCurrency(tds)}`, 160, 126)
      
      // Subtotal Line
      doc.setLineWidth(0.3)
      doc.line(20, 134, 190, 134)
      doc.setFont('Helvetica', 'bold')
      doc.text('Gross Earnings', 25, 140)
      doc.text(`Rs. ${formatCurrency(slip.gross_pay)}`, 75, 140)
      doc.text('Total Deductions', 115, 140)
      doc.text(`Rs. ${formatCurrency(slip.deductions)}`, 160, 140)
      doc.line(20, 144, 190, 144)
      
      // Net Salary Block
      doc.setFillColor(240, 253, 250) // Emerald light background
      doc.rect(20, 150, 170, 12, 'F')
      doc.setTextColor(13, 148, 136) // Emerald green text
      doc.setFontSize(10)
      doc.text('NET SALARY (TAKE HOME)', 25, 158)
      doc.text(`Rs. ${formatCurrency(slip.net_pay)}`, 145, 158)
      
      // Footer Note
      doc.setTextColor(148, 163, 184)
      doc.setFont('Helvetica', 'italic')
      doc.setFontSize(8)
      doc.text('Note: This is a system-generated salary slip and does not require an official signature.', 20, 178)
      
      doc.save(`SalarySlip_${slip.month.replace(/\s+/g, '_')}.pdf`)
    } catch (err) {
      console.error("Failed to generate PDF payslip:", err)
    }
  }

  const handleCreateClaim = async (e) => {
    e.preventDefault()
    if (!claimData.amount || !claimData.description) return
    
    try {
      setLoading(true)
      await employeeSelfService.submitReimbursement({
        expense_type: claimData.expenseType,
        amount: Number(claimData.amount),
        description: claimData.description
      })
      
      const payrollRes = await employeeSelfService.getPayroll()
      setData(payrollRes.data || payrollRes)
      
      setNewClaimModal(false)
      setClaimData({ expenseType: 'Travel Expense', amount: '', description: '' })
    } catch (err) {
      console.error("Failed to submit reimbursement claim:", err)
      alert("Failed to submit claim. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTaxDetails = async (e) => {
    if (e) e.preventDefault()
    if (!taxInput.panNumber) return
    
    try {
      setLoading(true)
      await employeeSelfService.updateTaxDetails({
        pan_number: taxInput.panNumber,
        tax_regime: taxInput.taxRegime
      })
      
      const payrollRes = await employeeSelfService.getPayroll()
      setData(payrollRes.data || payrollRes)
      setIsEditingTax(false)
    } catch (err) {
      console.error("Failed to update tax details:", err)
      alert("Failed to update tax details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const tabs = [
    { id: 'slips', label: 'Payslips', icon: FileText },
    { id: 'structure', label: 'Salary Structure', icon: Banknote },
    { id: 'tax', label: 'Tax Details', icon: Wallet },
    { id: 'reimbursements', label: 'Reimbursement Claims', icon: Receipt }
  ]

  // Extract variables for layout
  const netSalaryThisMonth = data?.payslips?.[0]?.net_pay || 0
  const thisMonthName = data?.payslips?.[0]?.month || 'N/A'
  const ctcAnnual = data?.ctc_annual || 0
  const ytdEarnings = data?.ytd_earnings || 0
  const ytdDeductions = data?.ytd_deductions || 0
  const payslipsList = (data?.payslips || []).filter(slip => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      const monthIndex = parseInt(month, 10) - 1;
      const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const targetMonthName = MONTH_NAMES[monthIndex];
      
      if (slip.pay_date) {
        const d = new Date(slip.pay_date);
        return d.getFullYear().toString() === year && d.getMonth() === monthIndex;
      }
      
      if (slip.month && typeof slip.month === 'string') {
        const slipMonthLower = slip.month.toLowerCase();
        return slipMonthLower.includes(targetMonthName.toLowerCase()) && slipMonthLower.includes(year);
      }
      return false;
    }
    
    if (selectedYear) {
      if (slip.pay_date) {
        const year = new Date(slip.pay_date).getFullYear().toString();
        return year === selectedYear;
      }
      if (slip.month && typeof slip.month === 'string') {
        return slip.month.includes(selectedYear);
      }
    }
    return true;
  })

  // Dynamic salary structure calculations
  const basic = data?.salary_structure?.basic || 0
  const hra = data?.salary_structure?.hra !== undefined ? data?.salary_structure?.hra : 0
  const spec = data?.salary_structure?.special_allowance !== undefined ? data?.salary_structure?.special_allowance : 0
  
  const pf = data?.salary_structure?.provident_fund !== undefined ? data?.salary_structure?.provident_fund : 0
  const pt = data?.salary_structure?.professional_tax !== undefined ? data?.salary_structure?.professional_tax : 0
  const tds = data?.salary_structure?.tds !== undefined ? data?.salary_structure?.tds : 0

  const totalGrossMonthly = basic + hra + spec
  const totalDeductionsMonthly = pf + pt + tds
  const netTakeHomeMonthly = totalGrossMonthly - totalDeductionsMonthly

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-slate-50/50 overflow-hidden font-sans">
      
      {/* Top Header Section */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-6 py-4 shrink-0">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">My Payroll</h1>
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-0.5">
            <span className="hover:text-slate-600 transition cursor-pointer" onClick={() => navigate('/employee/dashboard')}>Dashboard</span>
            <ChevronRight className="h-2.5 w-2.5" />
            <span>Payroll</span>
            <ChevronRight className="h-2.5 w-2.5" />
            <span className="text-slate-800 uppercase tracking-wider">Payslips</span>
          </div>
        </div>
      </div>

      {/* Horizontal Navigation Tabs */}
      <div className="px-6 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3.5 pt-4 text-xs font-black transition-all relative border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="w-full space-y-6">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              
              {/* TAB 1: PAYSLIPS */}
              {activeTab === 'slips' && (
                <div className="space-y-6">
                  
                  {/* Four Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Card 1: Net Salary This Month */}
                    <div className="bg-white border border-slate-150 rounded-none p-5 shadow-xs flex items-center justify-between">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">This Month ({thisMonthName})</span>
                        <span className="text-xl font-black text-slate-900 tracking-tight">₹ {formatCurrency(netSalaryThisMonth)}</span>
                        <span className="text-[10px] font-bold text-slate-400 block">Net Salary</span>
                      </div>
                      <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-none flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Card 2: CTC Annual */}
                    <div className="bg-white border border-slate-150 rounded-none p-5 shadow-xs flex items-center justify-between">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">CTC (Annual)</span>
                        <span className="text-xl font-black text-slate-900 tracking-tight">₹ {formatCurrency(ctcAnnual)}</span>
                        <span className="text-[10px] font-bold text-slate-400 block">Cost to Company</span>
                      </div>
                      <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-none flex items-center justify-center shrink-0">
                        <CreditCard className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Card 3: YTD Earnings */}
                    <div className="bg-white border border-slate-150 rounded-none p-5 shadow-xs flex items-center justify-between">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">YTD Earnings</span>
                        <span className="text-xl font-black text-slate-900 tracking-tight">₹ {formatCurrency(ytdEarnings)}</span>
                        <span className="text-[10px] font-bold text-slate-400 block">Apr 2026 - Jun 2026</span>
                      </div>
                      <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-none flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Card 4: YTD Deductions */}
                    <div className="bg-white border border-slate-150 rounded-none p-5 shadow-xs flex items-center justify-between">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">YTD Deductions</span>
                        <span className="text-xl font-black text-slate-900 tracking-tight">₹ {formatCurrency(ytdDeductions)}</span>
                        <span className="text-[10px] font-bold text-slate-400 block">Apr 2026 - Jun 2026</span>
                      </div>
                      <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-none flex items-center justify-center shrink-0">
                        <Percent className="h-5 w-5" />
                      </div>
                    </div>

                  </div>

                  {/* Main Table + Sidebar Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Left Table (70%) */}
                    <div className="lg:col-span-2 bg-white border border-slate-150 rounded-none p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <h2 className="text-base font-black text-slate-900 tracking-tight">Payslips</h2>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">View and download your monthly payslips</p>
                        </div>
                        
                        {/* Year selector & Date filter */}
                        <div className="flex items-center gap-2">
                          {selectedMonth && (
                            <button 
                              onClick={() => setSelectedMonth('')}
                              className="text-[10px] font-black text-red-600 hover:text-red-700 transition flex items-center gap-1 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-none cursor-pointer"
                            >
                              Clear: {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              <X className="h-3.5 w-3.5 ml-1" />
                            </button>
                          )}
                          <select 
                            value={selectedYear} 
                            onChange={e => {
                              setSelectedYear(e.target.value)
                              setSelectedMonth('')
                            }}
                            className="bg-slate-50 border border-slate-150 rounded-none px-3 py-2 text-xs font-bold text-slate-700 outline-none hover:bg-slate-100 transition cursor-pointer"
                          >
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                          </select>
                          <div className="relative h-8 w-8">
                            <button className="absolute inset-0 bg-slate-50 border border-slate-150 rounded-none flex items-center justify-center text-slate-400 hover:text-slate-700 transition pointer-events-none" title="Calendar Filter">
                              <Calendar className="h-4 w-4" />
                            </button>
                            <input 
                              type="month"
                              value={selectedMonth}
                              onChange={e => {
                                setSelectedMonth(e.target.value)
                                if (e.target.value) {
                                  setSelectedYear(e.target.value.split('-')[0])
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Payslips Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                              <th className="py-3 px-2">Month</th>
                              <th className="py-3 px-2">Pay Period</th>
                              <th className="py-3 px-2">Net Salary</th>
                              <th className="py-3 px-2">Status</th>
                              <th className="py-3 px-2">Download</th>
                              <th className="py-3 px-2 text-center w-10"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                            {payslipsList.map((slip, idx) => (
                              <tr 
                                key={slip.id || idx} 
                                className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                                  selectedSlip?.id === slip.id ? 'bg-blue-50/20' : ''
                                }`}
                                onClick={() => setSelectedSlip(slip)}
                              >
                                <td className="py-3.5 px-2">
                                  <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 rounded-none text-[9px] font-black uppercase mr-2.5 select-none">
                                    {slip.month.substring(0, 3)}
                                  </span>
                                  <span className="text-slate-800 font-extrabold">{slip.month}</span>
                                </td>
                                <td className="py-3.5 px-2 text-slate-500 font-semibold">{slip.pay_period}</td>
                                <td className="py-3.5 px-2 text-slate-800 font-extrabold">₹ {formatCurrency(slip.net_pay)}</td>
                                <td className="py-3.5 px-2">
                                  <span className="inline-flex px-2 py-0.5 rounded-none text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                                    Paid
                                  </span>
                                </td>
                                <td className="py-3.5 px-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      downloadPayslipPdf(slip)
                                    }}
                                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-slate-800 px-3 py-1.5 rounded-none transition cursor-pointer"
                                  >
                                    <Download className="h-3.5 w-3.5 text-blue-600" />
                                    Download
                                  </button>
                                </td>
                                <td className="py-3.5 px-2 text-center">
                                  <button 
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 hover:bg-slate-100 rounded-none text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-400">
                        <span>Showing 1 to {payslipsList.length} of {payslipsList.length} records</span>
                      </div>

                    </div>

                    {/* Right Sidebar Column (30%) */}
                    <div className="space-y-6">
                      
                      {/* Card 1: Selected Month Breakdown */}
                      {selectedSlip && (
                        <div className="bg-white border border-slate-150 rounded-none p-5 shadow-xs space-y-4">
                          <div>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">{selectedSlip.month} Payslip</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">
                              Paid on {selectedSlip.pay_date ? new Date(selectedSlip.pay_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '30 Jun 2026'}
                            </p>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-slate-100">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-400">Gross Salary</span>
                              <span className="text-slate-800 font-extrabold">₹ {formatCurrency(selectedSlip.gross_pay)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-400">Total Deductions</span>
                              <span className="text-slate-800 font-extrabold">₹ {formatCurrency(selectedSlip.deductions)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-semibold pt-2.5 border-t border-dashed border-slate-100">
                              <span className="text-slate-400 font-black">Net Salary</span>
                              <span className="text-sm font-black text-emerald-600">₹ {formatCurrency(selectedSlip.net_pay)}</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => downloadPayslipPdf(selectedSlip)}
                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-none text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                            View Payslip
                          </button>
                        </div>
                      )}

                      {/* Card 2: Support Ticket shortcut */}
                      <div className="bg-white border border-slate-150 rounded-none p-5 shadow-xs flex items-center justify-between">
                        <div className="space-y-2 max-w-8xl">
                          <h3 className="text-xs font-black text-slate-900 tracking-tight">Need Help?</h3>
                          <p className="text-[10px] font-semibold text-slate-400 leading-normal">Facing an issue with your payslip?</p>
                          <button 
                            onClick={() => navigate('/my-help-desk')}
                            className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-700 transition pt-1 cursor-pointer"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            Raise a Ticket
                          </button>
                        </div>
                        <div className="h-10 w-10 rounded-none bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <HelpCircle className="h-5 w-5" />
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: SALARY STRUCTURE */}
              {activeTab === 'structure' && (
                <div className="bg-white border border-slate-150 rounded-none p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight">Salary Structure</h2>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Breakdown of your monthly and annual compensation</p>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-none shadow-xs bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <th className="py-3.5 px-4">Component</th>
                          <th className="py-3.5 px-4">Calculation Method</th>
                          <th className="py-3.5 px-4 text-right">Monthly (INR)</th>
                          <th className="py-3.5 px-4 text-right">Annual (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                        {/* Earnings */}
                        <tr className="bg-slate-50/20">
                          <td className="py-3 px-4 text-slate-400 uppercase text-[9px] font-black tracking-wider" colSpan={4}>Earnings</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-4 text-slate-800 font-extrabold">Basic Salary</td>
                          <td className="py-3.5 px-4 text-slate-400 font-semibold">40% of Annual CTC</td>
                          <td className="py-3.5 px-4 text-right text-slate-800">₹ {formatCurrency(basic)}</td>
                          <td className="py-3.5 px-4 text-right text-slate-800">₹ {formatCurrency(basic * 12)}</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-4 text-slate-800 font-extrabold">House Rent Allowance (HRA)</td>
                          <td className="py-3.5 px-4 text-slate-400 font-semibold">50% of Basic Salary</td>
                          <td className="py-3.5 px-4 text-right text-slate-800">₹ {formatCurrency(hra)}</td>
                          <td className="py-3.5 px-4 text-right text-slate-800">₹ {formatCurrency(hra * 12)}</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-4 text-slate-800 font-extrabold">Special Allowance</td>
                          <td className="py-3.5 px-4 text-slate-400 font-semibold">Balanced allowance component</td>
                          <td className="py-3.5 px-4 text-right text-slate-800">₹ {formatCurrency(spec)}</td>
                          <td className="py-3.5 px-4 text-right text-slate-800">₹ {formatCurrency(spec * 12)}</td>
                        </tr>
                        
                        {/* Gross Earnings Subtotal */}
                        <tr className="bg-slate-50/40 border-t border-slate-100 font-black">
                          <td className="py-3.5 px-4 text-slate-900">Total Gross Earnings</td>
                          <td className="py-3.5 px-4"></td>
                          <td className="py-3.5 px-4 text-right text-slate-900">₹ {formatCurrency(totalGrossMonthly)}</td>
                          <td className="py-3.5 px-4 text-right text-slate-900">₹ {formatCurrency(totalGrossMonthly * 12)}</td>
                        </tr>

                        {/* Deductions */}
                        <tr className="bg-slate-50/20">
                          <td className="py-3 px-4 text-slate-400 uppercase text-[9px] font-black tracking-wider" colSpan={4}>Deductions</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-4 text-slate-800 font-extrabold">Provident Fund (PF)</td>
                          <td className="py-3.5 px-4 text-slate-400 font-semibold">12% of Basic + Special</td>
                          <td className="py-3.5 px-4 text-right text-red-650">₹ {formatCurrency(pf)}</td>
                          <td className="py-3.5 px-4 text-right text-red-650">₹ {formatCurrency(pf * 12)}</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-4 text-slate-800 font-extrabold">Professional Tax (PT)</td>
                          <td className="py-3.5 px-4 text-slate-400 font-semibold">State slab tax rate</td>
                          <td className="py-3.5 px-4 text-right text-red-650">₹ {formatCurrency(pt)}</td>
                          <td className="py-3.5 px-4 text-right text-red-650">₹ {formatCurrency(pt * 12)}</td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-4 text-slate-800 font-extrabold">Income Tax (TDS)</td>
                          <td className="py-3.5 px-4 text-slate-400 font-semibold">Estimated monthly income tax</td>
                          <td className="py-3.5 px-4 text-right text-red-650">₹ {formatCurrency(tds)}</td>
                          <td className="py-3.5 px-4 text-right text-red-650">₹ {formatCurrency(tds * 12)}</td>
                        </tr>

                        {/* Deductions Subtotal */}
                        <tr className="bg-slate-50/40 border-t border-slate-100 font-black">
                          <td className="py-3.5 px-4 text-slate-900">Total Deductions</td>
                          <td className="py-3.5 px-4"></td>
                          <td className="py-3.5 px-4 text-right text-red-650">₹ {formatCurrency(totalDeductionsMonthly)}</td>
                          <td className="py-3.5 px-4 text-right text-red-650">₹ {formatCurrency(totalDeductionsMonthly * 12)}</td>
                        </tr>

                        {/* Net Salary Summary */}
                        <tr className="bg-emerald-50/30 border-t border-slate-100 font-black text-emerald-800">
                          <td className="py-4 px-4 text-emerald-800">Net Take-Home Salary</td>
                          <td className="py-4 px-4"></td>
                          <td className="py-4 px-4 text-right text-emerald-800">₹ {formatCurrency(netTakeHomeMonthly)}</td>
                          <td className="py-4 px-4 text-right text-emerald-800">₹ {formatCurrency(netTakeHomeMonthly * 12)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: TAX DETAILS */}
              {activeTab === 'tax' && (
                <div className="space-y-6">
                  
                  {/* Tax Overview Panel */}
                  <div className="bg-white border border-slate-150 rounded-none p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-base font-black text-slate-900 tracking-tight">Income Tax Declarations</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">Submit and verify tax declarations for the current assessment year</p>
                      </div>
                      {!isEditingTax ? (
                        <button
                          onClick={() => {
                            setTaxInput({
                              panNumber: data?.tax_details?.pan_number || '',
                              taxRegime: data?.tax_details?.tax_regime || 'New Tax Regime (Section 115BAC)'
                            })
                            setIsEditingTax(true)
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 px-4 py-2 rounded-none text-xs font-bold transition cursor-pointer"
                        >
                          Update Tax Info
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSaveTaxDetails}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-none text-xs font-bold transition cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setIsEditingTax(false)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-none text-xs font-bold transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div className="border border-slate-100 rounded-none p-4 bg-slate-50/30">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Permanent Account Number (PAN)</span>
                        {isEditingTax ? (
                          <input
                            type="text"
                            value={taxInput.panNumber}
                            onChange={e => setTaxInput(p => ({ ...p, panNumber: e.target.value.toUpperCase() }))}
                            className="w-full bg-white border border-slate-200 rounded-none py-1.5 px-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 transition mt-1"
                            maxLength={10}
                            placeholder="e.g. ABCDE1234F"
                          />
                        ) : (
                          <span className="text-sm font-black text-slate-800">{data?.tax_details?.pan_number || 'Not Provided'}</span>
                        )}
                      </div>
                      <div className="border border-slate-100 rounded-none p-4 bg-slate-50/30">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Selected Regime</span>
                        {isEditingTax ? (
                          <select
                            value={taxInput.taxRegime}
                            onChange={e => setTaxInput(p => ({ ...p, taxRegime: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-none py-1.5 px-2 text-xs font-bold text-slate-850 outline-none focus:border-blue-500 transition mt-1"
                          >
                            <option value="New Tax Regime (Section 115BAC)">New Tax Regime (Section 115BAC)</option>
                            <option value="Old Tax Regime">Old Tax Regime</option>
                          </select>
                        ) : (
                          <span className="text-sm font-black text-slate-800">{data?.tax_details?.tax_regime || 'New Tax Regime (Section 115BAC)'}</span>
                        )}
                      </div>
                      <div className="border border-slate-100 rounded-none p-4 bg-slate-50/30">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Declared Deductions (YTD)</span>
                        <span className="text-sm font-black text-slate-800">₹ 0.00</span>
                      </div>
                    </div>

                    {/* Window Status Card */}
                    <div className="bg-amber-50/30 border border-amber-100 rounded-none p-5 flex items-start gap-4">
                      <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-none flex items-center justify-center shrink-0">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-amber-900">Tax declaration window is currently closed</h4>
                        <p className="text-[10px] font-bold text-slate-500 leading-normal">
                          The investment declaration window for financial year 2026-27 is closed. You can submit tax investment proofs at the end of the fiscal year or request HR/Admin to open the window.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: REIMBURSEMENTS */}
              {activeTab === 'reimbursements' && (
                <div className="bg-white border border-slate-150 rounded-none p-6 shadow-xs space-y-6">
                  
                  {/* Header and Add button */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-black text-slate-900 tracking-tight">Reimbursement Claims</h2>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">Track and submit business expense claims</p>
                    </div>
                    
                    <button 
                      onClick={() => setNewClaimModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 px-4 py-2 rounded-none text-xs font-bold shadow-lg shadow-blue-100 transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      New Claim
                    </button>
                  </div>

                  {/* Claims List Table */}
                  <div className="overflow-x-auto border border-slate-100 rounded-none shadow-xs bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <th className="py-3.5 px-4">Claim Date</th>
                          <th className="py-3.5 px-4">Expense Type</th>
                          <th className="py-3.5 px-4">Description</th>
                          <th className="py-3.5 px-4 text-right">Amount</th>
                          <th className="py-3.5 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                        {data?.reimbursements?.map((claim, idx) => (
                          <tr key={claim.id || idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 text-slate-500 font-semibold">{claim.claim_date}</td>
                            <td className="py-3.5 px-4 text-slate-800 font-extrabold">{claim.expense_type}</td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">{claim.description}</td>
                            <td className="py-3.5 px-4 text-right text-slate-800 font-extrabold">₹ {formatCurrency(claim.amount)}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-none text-[9px] font-bold border ${
                                claim.status === 'Approved' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                  : 'bg-blue-50 text-blue-700 border-blue-100'
                              }`}>
                                {claim.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(!data?.reimbursements || data.reimbursements.length === 0) && (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-slate-400 font-semibold">
                              No reimbursement claims found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* Claim Submission Modal */}
      {newClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-100 rounded-none w-full max-w-md shadow-2xl p-6 relative">
            <button 
              onClick={() => setNewClaimModal(false)}
              className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-none text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-lg font-black text-slate-900 tracking-tight mb-2">New Reimbursement Claim</h2>
            <p className="text-xs text-slate-500 font-medium mb-6">Submit an expense claim for validation and payroll reimbursement.</p>

            <form onSubmit={handleCreateClaim} className="space-y-4">
              
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Expense Type</label>
                <select 
                  value={claimData.expenseType}
                  onChange={e => setClaimData(p => ({...p, expenseType: e.target.value}))}
                  className="w-full bg-slate-50 border border-slate-150 rounded-none py-3 px-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500/20 transition"
                >
                  <option value="Travel Expense">Travel Expense</option>
                  <option value="Internet & Telephone">Internet & Telephone</option>
                  <option value="Medical Expenses">Medical Expenses</option>
                  <option value="Training & Development">Training & Development</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Amount (INR)</label>
                <input 
                  type="number"
                  required
                  placeholder="e.g. 2500"
                  value={claimData.amount}
                  onChange={e => setClaimData(p => ({...p, amount: e.target.value}))}
                  className="w-full bg-slate-50 border border-slate-150 rounded-none py-3 px-4 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500/20 transition shadow-inner"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Description</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Detail the purpose of the expense..."
                  value={claimData.description}
                  onChange={e => setClaimData(p => ({...p, description: e.target.value}))}
                  className="w-full bg-slate-50 border border-slate-150 rounded-none py-3 px-4 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500/20 transition shadow-inner resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setNewClaimModal(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-none text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1 py-2.5 rounded-none text-xs font-bold shadow-lg shadow-blue-100 transition cursor-pointer"
                >
                  Submit Claim
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
