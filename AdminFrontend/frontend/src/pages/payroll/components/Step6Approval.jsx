import { memo, useState } from 'react'

const Step6Approval = memo(({ onApprove, onReject, onNext }) => {
  const [comment, setComment] = useState('')
  const [activeTab, setActiveTab] = useState('Approval Info')
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    await onApprove?.()
    setIsApproving(false)
    onNext?.()
  }

  const handleReject = async () => {
    setIsRejecting(true)
    await onReject?.()
    setIsRejecting(false)
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">Payroll Cycle</p>
          <p className="font-bold text-slate-800 text-sm">April 2026 (01 Apr 2026 - 30 Apr 2026)</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">Status</p>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
            Pending Approval
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">Submitted By</p>
          <p className="font-bold text-slate-800 text-sm">Arzu Mehreen</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">Submitted On</p>
          <p className="font-bold text-slate-800 text-sm">25 Apr 2026, 11:30 AM</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        
        {/* Tabs */}
        <div className="flex items-center border-b border-slate-100">
          {['Approval Info', 'Approval History'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left: Approval Timeline */}
          <div className="p-8 border-r border-slate-100">
            <h3 className="font-bold text-slate-800 mb-6">Approval Summary</h3>
            
            <div className="relative pl-6 flex flex-col gap-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
              
              {/* Step 1: Submitted */}
              <div className="relative flex items-start gap-4">
                <div className="absolute left-[-24px] flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs ring-4 ring-white">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800">Submitted</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Arzu Mehreen (HR Executive)</p>
                  <p className="text-[10px] text-slate-400 mt-1">25 Apr 2026, 11:30 AM</p>
                </div>
              </div>

              {/* Step 2: Under Review */}
              <div className="relative flex items-start gap-4">
                <div className="absolute left-[-24px] flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-slate-300 text-slate-400 font-bold text-xs ring-4 ring-white">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800">Under Review</h4>
                  <p className="text-xs text-slate-500 mt-0.5">HR Manager</p>
                  <p className="text-[10px] text-amber-500 font-semibold mt-1">Pending</p>
                </div>
              </div>

              {/* Step 3: Final Approval */}
              <div className="relative flex items-start gap-4">
                <div className="absolute left-[-24px] flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-slate-300 text-slate-400 font-bold text-xs ring-4 ring-white">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800">Final Approval</h4>
                  <p className="text-xs text-slate-500 mt-0.5">HR Admin</p>
                  <p className="text-[10px] text-slate-400 mt-1">Pending</p>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Actions */}
          <div className="p-8 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 mb-4">Comment (Optional)</h3>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add your comments here..."
                className="w-full h-32 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none bg-white"
              />
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <button 
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="w-full bg-green-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-green-700 transition-colors shadow-sm shadow-green-200 disabled:opacity-50"
              >
                {isApproving ? 'Approving...' : 'Approve'}
              </button>
              <button 
                onClick={handleReject}
                disabled={isApproving || isRejecting}
                className="w-full bg-red-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-200 disabled:opacity-50"
              >
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </button>
              <button 
                className="w-full bg-white border border-slate-200 text-slate-700 font-bold text-sm py-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Request Changes
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
})

Step6Approval.displayName = 'Step6Approval'
export default Step6Approval
