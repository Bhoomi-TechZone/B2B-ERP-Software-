import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  Calendar, Clock, Link as LinkIcon, Users, Tag, FileText, 
  Activity, Save, Plus, Trash2, Video, CheckCircle, AlertCircle, Loader 
} from 'lucide-react';
import crmService from '../../../services/crmService';

const DemoSchedule = ({ opportunityId: propOppId } = {}) => {
  const { opportunityId: routeOppId } = useParams();
  const [searchParams] = useSearchParams();
  const queryOppId = searchParams.get('opportunityId');
  
  // Try multiple sources to get opportunityId, also check localStorage
  const storedOppId = typeof window !== 'undefined' ? localStorage.getItem('selectedOpportunityId') : null;
  const opportunityId = propOppId || routeOppId || queryOppId || storedOppId;

  const [formData, setFormData] = useState({
    demoType: 'generic',
    date: '',
    time: '',
    duration: '30',
    meetingLink: '',
    prospectAttendees: [{ name: '', email: '' }],
    internalAttendees: [],
    focusAreas: [],
    demoNotes: '',
    demoOutcome: '',
    followUpDate: ''
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [demoStatus, setDemoStatus] = useState('scheduled'); // 'scheduled' or 'completed'
  const [showOppIdModal, setShowOppIdModal] = useState(false);
  const [tempOppId, setTempOppId] = useState('');
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState('');

  // Use opportunityId from any source (props, route, or query params)
  const activeOppId = selectedOppId || opportunityId;

  useEffect(() => {
    // Log opportunityId for debugging
    console.log('DemoSchedule - activeOppId:', activeOppId);
    
    // Fetch all opportunities for the dropdown
    fetchAllOpportunities();
  }, [activeOppId]);

  const fetchAllOpportunities = async () => {
    try {
      const data = await crmService.getOpportunities();
      setAllOpportunities(data || []);
      
      // If no opportunity ID is set, auto-select the first one
      if (!activeOppId && data && data.length > 0) {
        const firstOpp = data[0];
        const oppId = firstOpp.opportunity?.id || firstOpp.opp?.id || firstOpp.id;
        setSelectedOppId(oppId);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    }
  };

  const focusAreaOptions = [
    'Payroll', 'Leave', 'Attendance', 'Recruitment', 'Reports', 'Compliance'
  ];

  const employeeOptions = [
    'Sarah Smith (Solutions Engineer)', 
    'Mike Johnson (Sales Executive)', 
    'David Chen (Product Manager)'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAttendeeChange = (index, field, value) => {
    const newAttendees = [...formData.prospectAttendees];
    newAttendees[index][field] = value;
    handleInputChange('prospectAttendees', newAttendees);
  };

  const addAttendee = () => {
    handleInputChange('prospectAttendees', [...formData.prospectAttendees, { name: '', email: '' }]);
  };

  const removeAttendee = (index) => {
    if (formData.prospectAttendees.length > 1) {
      const newAttendees = formData.prospectAttendees.filter((_, i) => i !== index);
      handleInputChange('prospectAttendees', newAttendees);
    }
  };

  const toggleFocusArea = (area) => {
    const current = formData.focusAreas;
    if (current.includes(area)) {
      handleInputChange('focusAreas', current.filter(a => a !== area));
    } else {
      handleInputChange('focusAreas', [...current, area]);
    }
  };

  const toggleInternalAttendee = (emp) => {
    const current = formData.internalAttendees;
    if (current.includes(emp)) {
      handleInputChange('internalAttendees', current.filter(e => e !== emp));
    } else {
      handleInputChange('internalAttendees', [...current, emp]);
    }
  };

  const validateForm = () => {
    if (!formData.date) {
      setError('Demo date is required');
      return false;
    }
    if (!formData.time) {
      setError('Demo time is required');
      return false;
    }
    if (!formData.meetingLink) {
      setError('Meeting link is required');
      return false;
    }
    if (formData.prospectAttendees.some(a => !a.name || !a.email)) {
      setError('All prospect attendees must have name and email');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.prospectAttendees.some(a => !emailRegex.test(a.email))) {
      setError('Invalid email format in attendees');
      return false;
    }

    setError('');
    return true;
  };

  const handleScheduleDemo = async (e) => {
    e.preventDefault();
    
    if (!activeOppId) {
      setError('Opportunity ID is required. Please pass it via route or props.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Combine date and time
      const demoDateTime = new Date(`${formData.date}T${formData.time}`);

      const payload = {
        demo_type: formData.demoType,
        demo_date: demoDateTime.toISOString(),
        demo_duration: parseInt(formData.duration),
        demo_meeting_link: formData.meetingLink,
        demo_focus_areas: formData.focusAreas,
        internal_attendees: formData.internalAttendees
      };

      await crmService.scheduleDemo(activeOppId, payload);
      
      setSuccessMessage('Demo scheduled successfully!');
      setIsSaved(true);
      setDemoStatus('scheduled');
      
      setTimeout(() => {
        setIsSaved(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error scheduling demo:', err);
      setError(err.response?.data?.detail || 'Failed to schedule demo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteDemo = async () => {
    if (!activeOppId) {
      setError('Opportunity ID is required. Please pass it via route or props.');
      return;
    }

    if (!formData.demoNotes) {
      setError('Demo notes are required to complete the demo');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        demo_notes: formData.demoNotes,
        demo_outcome: formData.demoOutcome || 'neutral',
        follow_up_date: formData.followUpDate ? new Date(formData.followUpDate).toISOString().split('T')[0] : null
      };

      await crmService.completeDemo(activeOppId, payload);
      
      setSuccessMessage('Demo completed successfully!');
      setDemoStatus('completed');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error completing demo:', err);
      setError(err.response?.data?.detail || 'Failed to complete demo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (!activeOppId) {
      setShowOppIdModal(true);
      return;
    }
    
    if (demoStatus === 'scheduled') {
      handleCompleteDemo();
    } else {
      handleScheduleDemo(e);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FA] p-6 h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Demo Management</h2>
          <p className="text-sm text-gray-500 mt-1">Schedule and manage product demonstrations with prospects</p>
        </div>
        
        {/* Opportunity Selector */}
        <div className="flex items-center gap-3">
          <select 
            value={activeOppId || ''}
            onChange={(e) => {
              setSelectedOppId(e.target.value);
              localStorage.setItem('selectedOpportunityId', e.target.value);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select Opportunity...</option>
            {allOpportunities.map((item) => {
              const opp = item.opportunity || item.opp || {};
              const lead = item.lead || {};
              const oppId = opp.id || opp._id || item.id;
              const companyName = lead.company_name || opp.company_name || 'Unknown Company';
              const contactName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown Contact';
              const dealValue = opp.deal_value || 0;
              
              return (
                <option key={oppId} value={oppId}>
                  {companyName} - {contactName} (${dealValue?.toLocaleString() || 0})
                </option>
              );
            })}
          </select>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isSaved ? (
            <>
              <CheckCircle className="h-4 w-4" />
              {demoStatus === 'scheduled' ? 'Demo Completed' : 'Demo Scheduled'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {demoStatus === 'scheduled' ? 'Complete Demo' : 'Schedule Demo'}
            </>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Opportunity ID Modal */}
      {showOppIdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Select Opportunity</h3>
            <p className="text-sm text-gray-600 mb-4">Choose an opportunity to schedule/complete demo for</p>
            
            {allOpportunities.length > 0 ? (
              <select 
                value={tempOppId}
                onChange={(e) => setTempOppId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm mb-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select an opportunity...</option>
                {allOpportunities.map((item) => {
                  const opp = item.opportunity || item.opp || {};
                  const lead = item.lead || {};
                  const oppId = opp.id || opp._id || item.id;
                  const companyName = lead.company_name || opp.company_name || 'Unknown Company';
                  const contactName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown Contact';
                  const dealValue = opp.deal_value || 0;
                  
                  return (
                    <option key={oppId} value={oppId}>
                      {companyName} - {contactName} (${dealValue?.toLocaleString() || 0})
                    </option>
                  );
                })}
              </select>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No opportunities found. Please create an opportunity first.</p>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowOppIdModal(false);
                  setTempOppId('');
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (tempOppId.trim()) {
                    setSelectedOppId(tempOppId.trim());
                    localStorage.setItem('selectedOpportunityId', tempOppId.trim());
                    setShowOppIdModal(false);
                  }
                }}
                disabled={!tempOppId.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Load Demo
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
        {/* Left Column: Core Scheduling */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              Scheduling Details
            </h3>
            
            <div className="space-y-5">
              {/* Demo Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Demo Type *</label>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 flex-1">
                    <input 
                      type="radio" 
                      name="demoType" 
                      value="generic"
                      checked={formData.demoType === 'generic'}
                      onChange={(e) => handleInputChange('demoType', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm font-medium text-gray-900">Generic Product Demo</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 flex-1">
                    <input 
                      type="radio" 
                      name="demoType" 
                      value="custom"
                      checked={formData.demoType === 'custom'}
                      onChange={(e) => handleInputChange('demoType', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm font-medium text-gray-900">Custom Demo (Tailored)</span>
                  </label>
                </div>
              </div>

              {/* Date, Time, Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Time *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="time" 
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Duration *</label>
                  <select 
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes (1 hour)</option>
                    <option value="90">90 minutes (1.5 hours)</option>
                  </select>
                </div>
              </div>

              {/* Meeting Link */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Meeting Link / Location *</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="https://zoom.us/j/..."
                    value={formData.meetingLink}
                    onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Zoom, Google Meet, Teams, or physical location.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-3">
              <Users className="h-5 w-5 text-purple-600" />
              Attendees
            </h3>
            
            <div className="space-y-6">
              {/* Prospect Attendees */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Prospect Attendees *</label>
                  <button 
                    type="button" 
                    onClick={addAttendee}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Another
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.prospectAttendees.map((attendee, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input 
                        type="text" 
                        placeholder="Full Name"
                        value={attendee.name}
                        onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input 
                        type="email" 
                        placeholder="Email Address"
                        value={attendee.email}
                        onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button 
                        onClick={() => removeAttendee(index)}
                        disabled={formData.prospectAttendees.length === 1}
                        className={`p-2 rounded-lg ${formData.prospectAttendees.length === 1 ? 'text-gray-300' : 'text-red-500 hover:bg-red-50'}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal Attendees */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Internal Attendees (Optional)</label>
                <div className="flex flex-col gap-2">
                  {employeeOptions.map(emp => (
                    <label key={emp} className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.internalAttendees.includes(emp)}
                        onChange={() => toggleInternalAttendee(emp)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{emp}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Content & Post-Demo */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-3">
              <Tag className="h-5 w-5 text-orange-500" />
              Demo Focus
            </h3>
            
            <label className="mb-3 block text-sm font-medium text-gray-700">Focus Areas (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {focusAreaOptions.map(area => {
                const isSelected = formData.focusAreas.includes(area);
                return (
                  <button
                    key={area}
                    onClick={() => toggleFocusArea(area)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-3">
              <FileText className="h-5 w-5 text-green-600" />
              Post-Demo Action
            </h3>
            
            <div className="space-y-4">
              {/* Demo Notes */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Demo Notes *</label>
                <textarea 
                  rows="4"
                  placeholder="Reactions, objections raised, next steps..."
                  value={formData.demoNotes}
                  onChange={(e) => handleInputChange('demoNotes', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  disabled={demoStatus !== 'scheduled'}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Required to mark demo as Completed.</p>
              </div>

              {/* Demo Outcome */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Outcome</label>
                <select 
                  value={formData.demoOutcome}
                  onChange={(e) => handleInputChange('demoOutcome', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={demoStatus !== 'scheduled'}
                >
                  <option value="">Select Outcome...</option>
                  <option value="very_positive">Very Positive</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                  <option value="no_show">No-show</option>
                </select>
              </div>

              {/* Follow-up Date */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Follow-up Date</label>
                  <button 
                    type="button"
                    onClick={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 2);
                      handleInputChange('followUpDate', date.toISOString().split('T')[0]);
                    }}
                    disabled={demoStatus !== 'scheduled'}
                    className="text-xs text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Auto-suggest T+2
                  </button>
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="date" 
                    value={formData.followUpDate}
                    onChange={(e) => handleInputChange('followUpDate', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={demoStatus !== 'scheduled'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoSchedule;
