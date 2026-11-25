import { memo, useState } from 'react'
import { FileCheck, FileArchive, Building2, BookOpen, Download, Play, ArrowRight } from 'lucide-react'

const Step7Generate = memo(({ employees = [], onGeneratePayslips, onNext }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const totalEmployees = employees.length || 24

  const handleGenerate = async () => {
    setIsGenerating(true)
    await onGeneratePayslips?.()
    setIsGenerating(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <FileArchive className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Payslips To Generate</p>
          <h2 className="text-xl font-bold text-slate-800">{totalEmployees}</h2>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <FileCheck className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Payslips Generated</p>
          <h2 className="text-xl font-bold text-slate-800">{totalEmployees}</h2>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Bank File Status</p>
          <h2 className="text-xl font-bold text-slate-800">Ready</h2>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Reports</p>
          <h2 className="text-xl font-bold text-slate-800">4</h2>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden p-6">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-bold text-slate-800">Generate Payslips</h3>
            <p className="text-xs text-slate-500 mt-1">Generate payslips for all employees and download in bulk.</p>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : <><Play className="w-4 h-4 fill-current" /> Generate Payslips</>}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          
          {/* Item 1 */}
          <div className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileArchive className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Payslip ZIP File</h4>
                <p className="text-xs text-slate-500 mt-0.5">Download all payslips in ZIP format</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-blue-600 font-semibold text-xs border border-blue-200 bg-white px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>

          {/* Item 2 */}
          <div className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Bank Transfer File</h4>
                <p className="text-xs text-slate-500 mt-0.5">Download bank transfer file for salary</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-blue-600 font-semibold text-xs border border-blue-200 bg-white px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>

          {/* Item 3 */}
          <div className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Salary Register</h4>
                <p className="text-xs text-slate-500 mt-0.5">Download salary register report</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-blue-600 font-semibold text-xs border border-blue-200 bg-white px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>

          {/* Item 4 */}
          <div className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Payroll Summary Report</h4>
                <p className="text-xs text-slate-500 mt-0.5">Download complete payroll summary</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-blue-600 font-semibold text-xs border border-blue-200 bg-white px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>

        </div>
        
        {/* Next Button */}
        <div className="mt-8 flex justify-end">
           <button 
              onClick={onNext}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 flex items-center gap-2 transition-colors"
            >
              Continue to Finalize <ArrowRight className="w-4 h-4" />
            </button>
        </div>

      </div>
    </div>
  )
})

Step7Generate.displayName = 'Step7Generate'
export default Step7Generate
