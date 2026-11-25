import { memo, useState } from 'react'
import { Search, ChevronRight, Upload, Edit2, Eye, MoreVertical, ArrowRight, Gift, Clock, FileEdit, HelpCircle, FileText } from 'lucide-react'
import PayrollModal from './PayrollModal'

const Step2Earnings = memo(({ employees = [], summary = {}, onUpdate, onNext, onPrev, onSyncAttendance }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [department, setDepartment] = useState('All')
  const [location, setLocation] = useState('All')

  // Modal States
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [bulkActionType, setBulkActionType] = useState('') // 'bonus' or 'overtime' or 'earnings'
  const [bulkValue, setBulkValue] = useState('')
  const [bulkEarningsField, setBulkEarningsField] = useState('basic')
  
  const [isSyncing, setIsSyncing] = useState(false)
  const [importStep, setImportStep] = useState(0) // 0: closed, 1: setup, 2: preview
  const [previewData, setPreviewData] = useState(null)
  const [importSource, setImportSource] = useState('module')

  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewEmp, setPreviewEmp] = useState(null)

  const [selectedRowIds, setSelectedRowIds] = useState(new Set())

  // Derived stats
  const totalEmployees = employees.length
  let totalPresent = 0
  let totalOT = 0
  let totalLeave = 0
  let totalLOP = 0

  employees.forEach(emp => {
    if (emp.attendance) {
      totalPresent += Number(emp.attendance.present_days || 0)
      totalOT += Number(emp.attendance.ot_hours || 0)
      totalLeave += Number(emp.attendance.leave_days || 0)
      totalLOP += Number(emp.attendance.absent_days || 0)
    }
  })

  const avgPresent = totalEmployees ? (totalPresent / totalEmployees).toFixed(1) : 0

  const filteredEmployees = employees.filter(emp => {
    const nameStr = emp.name?.toLowerCase() || ''
    const idStr = emp.employeeId?.toLowerCase() || ''
    const searchStr = searchTerm.toLowerCase()
    const matchesSearch = nameStr.includes(searchStr) || idStr.includes(searchStr)
    const matchesDept = department === 'All' || emp.department === department
    return matchesSearch && matchesDept
  })

  // Handlers
  const handleOpenEdit = (emp) => {
    setSelectedEmp(emp)
    setEditFormData({
      basic: emp.basic || 0,
      hra: emp.hra || 0,
      allowances: emp.allowances || 0,
      bonus: emp.bonus || 0,
      overtime: emp.overtime || 0
    })
    setEditModalOpen(true)
  }

  const handleOpenPreview = (emp) => {
    setPreviewEmp(emp)
    setPreviewModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (selectedEmp && onUpdate) {
      await onUpdate(selectedEmp.id, {
        basic: Number(editFormData.basic),
        hra: Number(editFormData.hra),
        allowances: Number(editFormData.allowances),
        bonus: Number(editFormData.bonus),
        overtime: Number(editFormData.overtime)
      })
    }
    setEditModalOpen(false)
  }

  const handleBulkAction = async () => {
    if (!onUpdate) return
    const val = Number(bulkValue)
    if (isNaN(val)) return
    
    const targetEmployees = selectedRowIds.size > 0 
      ? filteredEmployees.filter(e => selectedRowIds.has(e.id))
      : filteredEmployees

    for (const emp of targetEmployees) {
      let dataToUpdate = {}
      if (bulkActionType === 'bonus') dataToUpdate.bonus = val
      else if (bulkActionType === 'overtime') dataToUpdate.overtime = val
      else if (bulkActionType === 'earnings') {
        dataToUpdate[bulkEarningsField] = val
      }
      
      await onUpdate(emp.id, dataToUpdate)
    }
    setBulkModalOpen(false)
    setBulkValue('')
    setSelectedRowIds(new Set()) // clear selection after bulk action
  }

  const handleSyncClick = () => {
    setImportStep(1)
  }

  const handlePreviewImport = async () => {
    if (!onSyncAttendance) return
    setIsSyncing(true)
    try {
      const attData = await onSyncAttendance(filteredEmployees.map(e => e.id), true)
      
      const mappedPreview = filteredEmployees.map(emp => {
        const match = attData.find(a => a.employee_id === emp.id)
        return { 
          ...emp, 
          previewAttendance: match || { present_days: 0, leave_days: 0, absent_days: 0, ot_hours: 0 } 
        }
      })
      setPreviewData(mappedPreview)
      setImportStep(2)
    } catch (err) {
      alert("Failed to fetch preview.")
    }
    setIsSyncing(false)
  }

  const handleConfirmImport = async () => {
    if (!onSyncAttendance) return
    setIsSyncing(true)
    try {
      await onSyncAttendance(filteredEmployees.map(e => e.id), false)
      setImportStep(0)
      setPreviewData(null)
    } catch (err) {
      alert("Failed to confirm import.")
    }
    setIsSyncing(false)
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top 5 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Attendance Summary</p>
            <div className="flex items-end gap-2">
              <h2 className="text-2xl font-bold text-slate-800">{totalEmployees}</h2>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Total Employees</p>
          </div>
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Avg. Present Days</p>
            <div className="flex items-end gap-1">
              <h2 className="text-2xl font-bold text-slate-800">{avgPresent}</h2>
              <span className="text-sm font-semibold text-slate-400 mb-1">/26</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">This Month</p>
          </div>
          <div className="h-10 w-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Overtime Hours</p>
            <div className="flex items-end gap-2">
              <h2 className="text-2xl font-bold text-slate-800">{totalOT.toFixed(2)}</h2>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Total Hours</p>
          </div>
          <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Amount (Gross)</p>
            <div className="flex items-end gap-2">
              <h2 className="text-2xl font-bold text-slate-800">₹{Number(summary.totalGross || 0).toLocaleString('en-IN')}</h2>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Total Earnings</p>
          </div>
          <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Employees</p>
            <div className="flex items-end gap-2">
              <h2 className="text-2xl font-bold text-slate-800">{totalEmployees}</h2>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Selected</p>
          </div>
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
             <span className="font-bold text-lg">{totalEmployees}</span>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COMPREHENSIVE TABLE (col-span-3) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search employees..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <select 
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none"
              >
                <option value="All">Department: All</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
              <select 
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none"
              >
                <option value="All">Location: All</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-500">{filteredEmployees.length} of {employees.length} employees</span>
              <button 
                onClick={handleSyncClick}
                className="flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <Upload className="w-4 h-4" /> Import Attendance
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-4 w-10 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      checked={filteredEmployees.length > 0 && selectedRowIds.size === filteredEmployees.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRowIds(new Set(filteredEmployees.map(emp => emp.id)))
                        } else {
                          setSelectedRowIds(new Set())
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-4">Employee<br/><span className="text-[9px] font-normal text-slate-400">ID & Department</span></th>
                  <th className="px-4 py-4 text-center bg-slate-50 border-x border-slate-100">
                    <div className="mb-2">Attendance</div>
                    <div className="grid grid-cols-4 text-[9px] font-semibold text-slate-600">
                      <span>Present</span><span>Leave</span><span>LOP</span><span>OT (Hrs)</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right bg-green-50/30 text-green-700">Earnings<br/><span className="text-[9px] font-normal text-green-600/70">Gross Salary</span></th>
                  <th className="px-4 py-4 text-right bg-red-50/30 text-red-700">Deductions<br/><span className="text-[9px] font-normal text-red-600/70">Total Deductions</span></th>
                  <th className="px-4 py-4 text-right text-blue-700">Net Salary</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredEmployees.map((emp, i) => {
                  const present = Number(emp.attendance?.present_days || 0)
                  const leave = Number(emp.attendance?.leave_days || 0)
                  const lop = Number(emp.attendance?.absent_days || 0)
                  const ot = Number(emp.attendance?.ot_hours || 0)
                  const gross = Number(emp.gross || 0)
                  const deductions = Number(emp.deductions || 0)
                  const net = Number(emp.netPay || 0)

                  // Colors for avatars
                  const colors = ['bg-emerald-500', 'bg-indigo-500', 'bg-amber-500', 'bg-sky-500', 'bg-rose-500']
                  const colorClass = colors[i % colors.length]

                  return (
                    <tr key={emp.id} className={`transition-colors ${selectedRowIds.has(emp.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedRowIds.has(emp.id)}
                          onChange={() => {
                            const newSet = new Set(selectedRowIds)
                            if (newSet.has(emp.id)) newSet.delete(emp.id)
                            else newSet.add(emp.id)
                            setSelectedRowIds(newSet)
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${colorClass}`}>
                            {(emp.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{emp.name || 'Unknown Employee'}</p>
                            <p className="text-[10px] text-slate-500">{emp.employeeId || 'N/A'} • {emp.department || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-x border-slate-100 bg-slate-50/30">
                        <div className="grid grid-cols-4 text-center text-xs font-semibold text-slate-700">
                          <span>{present}</span>
                          <span>{leave}</span>
                          <span>{lop}</span>
                          <span>{ot.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700">
                        ₹{gross.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700">
                        ₹{deductions.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        ₹{net.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600">
                          In Progress
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                            title="Edit Earnings"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleOpenPreview(emp)}
                            className="p-1.5 text-slate-500 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                            title="Preview Payslip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer actions */}
          <div className="p-4 border-t border-slate-100 bg-blue-50/50 flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-2xl">
            <p className="text-xs text-blue-700 flex items-center gap-1.5 font-medium">
              <span className="flex items-center justify-center w-4 h-4 rounded-full border border-blue-400 text-[10px]">i</span>
              Tip: Click on edit icon to update earnings, bonus, overtime or other components for any employee.
            </p>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={onPrev}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>
              <button 
                onClick={onNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-md shadow-blue-200 transition-colors"
              >
                Continue to Statutory Deductions <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (col-span-1) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          
          {/* Payroll Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800">Payroll Overview</h3>
            </div>
            
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span className="flex items-center gap-2"><div className="w-4 flex justify-center">👥</div> Total Employees</span>
                <span className="font-bold text-slate-800">{totalEmployees}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span className="flex items-center gap-2"><div className="w-4 flex justify-center">📅</div> Total Gross Salary</span>
                <span className="font-bold text-slate-800">₹{Number(summary.totalGross || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span className="flex items-center gap-2"><div className="w-4 flex justify-center text-red-500">⏱</div> Total Deductions</span>
                <span className="font-bold text-red-600">-₹{Number(summary.totalDeductions || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="h-px bg-slate-100 my-1"></div>
              <div className="flex justify-between items-center text-slate-800 font-bold">
                <span className="flex items-center gap-2"><div className="w-4 flex justify-center text-green-500">💰</div> Total Net Salary</span>
                <span className="text-green-700">₹{Number(summary.totalNet || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { setBulkActionType('bonus'); setBulkModalOpen(true) }}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-green-200 bg-green-50/50 text-green-700 hover:bg-green-50 text-sm font-semibold transition-colors"
              >
                <Gift className="w-4 h-4" /> Add Bonus / Incentive
              </button>
              <button 
                onClick={() => { setBulkActionType('overtime'); setBulkModalOpen(true) }}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-50 text-sm font-semibold transition-colors"
              >
                <Clock className="w-4 h-4" /> Add Overtime
              </button>
              <button 
                onClick={() => { setBulkActionType('earnings'); setBulkModalOpen(true) }}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-purple-200 bg-purple-50/50 text-purple-700 hover:bg-purple-50 text-sm font-semibold transition-colors"
              >
                <FileEdit className="w-4 h-4" /> Bulk Earnings Update
              </button>
            </div>
          </div>

          {/* Attendance Health */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">Attendance Health</h3>
            <div className="flex items-center justify-between gap-4">
              
              {/* CSS Doughnut Chart */}
              <div className="relative w-24 h-24 rounded-full flex items-center justify-center shrink-0" 
                style={{
                  background: `conic-gradient(#10b981 0% 70%, #f59e0b 70% 85%, #ef4444 85% 90%, #94a3b8 90% 100%)`
                }}
              >
                <div className="w-16 h-16 bg-white rounded-full absolute"></div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2 w-full text-xs font-semibold text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Present (24+)</span>
                  <span>{employees.filter(e => Number(e.attendance?.present_days || 0) >= 24).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Leave</span>
                  <span>{employees.filter(e => Number(e.attendance?.leave_days || 0) > 0).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> LOP</span>
                  <span>{employees.filter(e => Number(e.attendance?.absent_days || 0) > 0).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div> Absent</span>
                  <span>0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Edit Earnings Modal */}
      <PayrollModal 
        isOpen={editModalOpen} 
        onClose={() => setEditModalOpen(false)}
        title={selectedEmp ? `Edit Earnings - ${selectedEmp.name}` : 'Edit Earnings'}
      >
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Basic Salary (₹)</label>
              <input 
                type="number" 
                value={editFormData.basic || ''} 
                onChange={(e) => setEditFormData({...editFormData, basic: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">HRA (₹)</label>
              <input 
                type="number" 
                value={editFormData.hra || ''} 
                onChange={(e) => setEditFormData({...editFormData, hra: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Allowances (₹)</label>
              <input 
                type="number" 
                value={editFormData.allowances || ''} 
                onChange={(e) => setEditFormData({...editFormData, allowances: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Bonus (₹)</label>
                <input 
                  type="number" 
                  value={editFormData.bonus || ''} 
                  onChange={(e) => setEditFormData({...editFormData, bonus: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Overtime (Hours)</label>
                <input 
                  type="number" 
                  value={editFormData.overtime || ''} 
                  onChange={(e) => setEditFormData({...editFormData, overtime: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <button 
              onClick={() => setEditModalOpen(false)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveEdit}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </PayrollModal>

      {/* Bulk Action Modal */}
      <PayrollModal 
        isOpen={bulkModalOpen} 
        onClose={() => setBulkModalOpen(false)}
        title={
          bulkActionType === 'bonus' ? 'Add Bulk Bonus' : 
          bulkActionType === 'overtime' ? 'Add Bulk Overtime' : 'Bulk Earnings Update'
        }
      >
        <div className="p-6">
          <p className="text-sm text-slate-500 mb-6">
            This will apply the update to {selectedRowIds.size > 0 ? selectedRowIds.size : filteredEmployees.length} {selectedRowIds.size > 0 ? 'selected' : 'currently filtered'} employees.
          </p>
          
          <div className="flex flex-col gap-4">
            {bulkActionType === 'earnings' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Earnings Component</label>
                <select 
                  value={bulkEarningsField}
                  onChange={(e) => setBulkEarningsField(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="basic">Basic Salary</option>
                  <option value="hra">HRA</option>
                  <option value="allowances">Allowances</option>
                  <option value="bonus">Bonus</option>
                  <option value="overtime">Overtime</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                {bulkActionType === 'bonus' ? 'Bonus Amount (₹)' : 
                 bulkActionType === 'overtime' ? 'Overtime (Hours/Amount)' : 'Update Value (₹)'}
              </label>
              <input 
                type="number" 
                value={bulkValue} 
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <button 
              onClick={() => setBulkModalOpen(false)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleBulkAction}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm ${
                bulkActionType === 'bonus' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 
                bulkActionType === 'overtime' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
              }`}
            >
              Apply to All
            </button>
          </div>
        </div>
      </PayrollModal>

      {/* Import Attendance Modal */}
      <PayrollModal 
        isOpen={importStep > 0} 
        onClose={() => setImportStep(0)}
        title="Import Attendance"
      >
        <div className="p-6">
          
          {importStep === 1 && (
            <div className="flex flex-col gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-1">Payroll Month</p>
                <p className="text-xs text-slate-500">Currently selected cycle will be used for import.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-3">Attendance Source</label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 p-3 border border-blue-200 bg-blue-50/30 rounded-lg cursor-pointer">
                    <input 
                      type="radio" 
                      name="source" 
                      checked={importSource === 'module'}
                      onChange={() => setImportSource('module')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm font-semibold text-blue-800">HR Attendance Module</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer opacity-60">
                    <input 
                      type="radio" 
                      name="source" 
                      disabled
                      checked={importSource === 'excel'}
                      onChange={() => setImportSource('excel')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm font-semibold text-slate-700">Excel Upload (Coming Soon)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
                <span className="text-sm font-semibold">Employees Found</span>
                <span className="text-lg font-bold">{filteredEmployees.length}</span>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button 
                  onClick={() => setImportStep(0)}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePreviewImport}
                  disabled={isSyncing}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 disabled:opacity-50"
                >
                  {isSyncing ? 'Fetching...' : 'Preview Import'}
                </button>
              </div>
            </div>
          )}

          {importStep === 2 && previewData && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-600 mb-2">Review the attendance data below before confirming the import.</p>
              
              <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3 text-center">Present</th>
                      <th className="px-4 py-3 text-center">Leave</th>
                      <th className="px-4 py-3 text-center text-red-500">LOP</th>
                      <th className="px-4 py-3 text-center text-amber-500">OT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {previewData.map(emp => {
                      const att = emp.previewAttendance;
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-semibold text-slate-800">{emp.name}</td>
                          <td className="px-4 py-2 text-center text-slate-600">{att?.present_days || 0}</td>
                          <td className="px-4 py-2 text-center text-slate-600">{att?.leave_days || 0}</td>
                          <td className="px-4 py-2 text-center text-red-600 font-medium">{att?.absent_days || 0}</td>
                          <td className="px-4 py-2 text-center text-amber-600 font-medium">{att?.ot_hours || 0}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setImportStep(1)}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleConfirmImport}
                  disabled={isSyncing}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm shadow-green-200 disabled:opacity-50"
                >
                  {isSyncing ? 'Importing...' : 'Confirm Import'}
                </button>
              </div>
            </div>
          )}
        </div>
      </PayrollModal>

      {/* Payslip Preview Modal */}
      <PayrollModal 
        isOpen={previewModalOpen} 
        onClose={() => setPreviewModalOpen(false)}
        title={previewEmp ? `Payslip Preview - ${previewEmp.name}` : 'Payslip Preview'}
      >
        {previewEmp && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{previewEmp.name}</h3>
                <p className="text-sm text-slate-500">{previewEmp.employeeId} • {previewEmp.department}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-500">Net Pay</p>
                <h3 className="text-2xl font-bold text-green-600">₹{Number(previewEmp.netPay || 0).toLocaleString('en-IN')}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Earnings */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Earnings</h4>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic</span>
                    <span className="font-semibold text-slate-800">₹{Number(previewEmp.basic || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">HRA</span>
                    <span className="font-semibold text-slate-800">₹{Number(previewEmp.hra || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Allowances</span>
                    <span className="font-semibold text-slate-800">₹{Number(previewEmp.allowances || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bonus</span>
                    <span className="font-semibold text-slate-800">₹{Number(previewEmp.bonus || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Overtime</span>
                    <span className="font-semibold text-slate-800">₹{Number(previewEmp.overtime || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800">Gross Earnings</span>
                    <span className="text-slate-800">₹{Number(previewEmp.gross || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Deductions</h4>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">PF</span>
                    <span className="font-semibold text-slate-800">₹{Number(previewEmp.pf || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">ESI</span>
                    <span className="font-semibold text-slate-800">₹{Number(previewEmp.esi || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Professional Tax</span>
                    <span className="font-semibold text-slate-800">₹{Number(previewEmp.pt || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">TDS</span>
                    <span className="font-semibold text-slate-800">₹{Number(previewEmp.tds || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Loan & Advance</span>
                    <span className="font-semibold text-slate-800">₹{Number((previewEmp.loan || 0) + (previewEmp.advance || 0)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Other Deductions</span>
                    <span className="font-semibold text-slate-800">₹{Number(previewEmp.other || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800">Total Deductions</span>
                    <span className="text-red-600">₹{Number(previewEmp.deductions || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setPreviewModalOpen(false)}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </PayrollModal>

    </div>
  )
})

Step2Earnings.displayName = 'Step2Earnings'
export default Step2Earnings
