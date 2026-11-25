import React, { useState } from "react";
import { Tabs } from "@headlessui/react";
import { KanbanSquare, Table, Users, BarChart2, Settings, UserPlus2, Calendar, MapPin, AlertTriangle, Repeat2, TrendingUp, ClipboardList, FileText, UserCheck, UserCog, Layers, ListChecks, PieChart, CheckCircle2, XCircle, AlertCircle, ArrowRightLeft, Globe2, History, Zap, UserGroup2 } from "lucide-react";
import LeadsTable from "./crm/LeadsTable";
import PipelineBoard from "./crm/PipelineBoard";
import OnboardingBoard from "./crm/OnboardingBoard";
import TeamAssignment from "./crm/TeamAssignment";
import "../../App.css";

const crmTabs = [
  {
    name: "Leads",
    icon: <UserPlus2 size={18} />, // 7.2
    component: <LeadsTable />,
    description: "All leads, Kanban, import, duplicate/stale detection, assignment."
  },
  {
    name: "Pipeline",
    icon: <KanbanSquare size={18} />, // 7.3
    component: <PipelineBoard />,
    description: "Kanban, table, forecast, won/lost, discount queue, demo calendar."
  },
  {
    name: "Onboarding",
    icon: <ClipboardList size={18} />, // 7.4
    component: <OnboardingBoard />,
    description: "Onboarding Kanban, health scores, milestones, CSM workload, UAT."
  },
  {
    name: "Team Mgmt",
    icon: <Users size={18} />, // 7.5
    component: <TeamAssignment />,
    description: "Org chart, workload, assignment history, rules, territory config."
  }
];

export default function CRMPipelineManagementPage() {
  const [tabIdx, setTabIdx] = useState(0);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <BarChart2 className="text-blue-600" size={28} /> CRM Pipeline Management
      </h1>
      <p className="text-gray-500 mb-6">Full platform-level CRM access for Admin. Manage leads, pipeline, onboarding, and team assignments.</p>
      <Tabs selectedIndex={tabIdx} onChange={setTabIdx}>
        <Tabs.List className="flex gap-2 border-b mb-4">
          {crmTabs.map((tab, idx) => (
            <Tabs.Tab
              key={tab.name}
              className={({ selected }) =>
                `px-4 py-2 flex items-center gap-2 rounded-t-md font-medium transition-colors duration-150 ${
                  selected ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {tab.icon} {tab.name}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <div className="bg-white rounded shadow p-4 min-h-[400px]">
          {crmTabs[tabIdx].component}
        </div>
        <div className="mt-2 text-xs text-gray-400">{crmTabs[tabIdx].description}</div>
      </Tabs>
    </div>
  );
}
