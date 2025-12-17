import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Beaker, 
  Settings, 
  Users, 
  BarChart3,
  ClipboardList,
  Calendar,
  Bell
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/doctor/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and statistics'
  },
  {
    name: 'Event Logs',
    href: '/doctor/event-log',
    icon: FileText,
    description: 'System event monitoring'
  },
  {
    name: 'My Schedule',
    href: '/doctor/schedule',
    icon: Calendar,
    description: 'My work shifts'
  },
  {
    name: 'Laboratory Tests',
    href: '/doctor/tests',
    icon: Beaker,
    description: 'Manage test results'
  },
  {
    name: 'Appointments',
    href: '/doctor/appointments',
    icon: Calendar,
    description: 'Patient appointments'
  },
  {
    name: 'Reports',
    href: '/doctor/reports',
    icon: BarChart3,
    description: 'Analytics and reports'
  },
  {
    name: 'Inventory',
    href: '/doctor/inventory',
    icon: ClipboardList,
    description: 'Lab equipment & supplies'
  },
  {
    name: 'Patients',
    href: '/doctor/patients',
    icon: Users,
    description: 'Patient management'
  },
  {
    name: 'Notifications',
    href: '/doctor/notifications',
    icon: Bell,
    description: 'System alerts'
  },
  {
    name: 'Settings',
    href: '/doctor/settings',
    icon: Settings,
    description: 'System configuration'
  }
];

const DoctorNavigation: React.FC = () => {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 w-64 h-screen fixed left-0 top-0 flex flex-col">
      {/* Header Section - Fixed */}
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center">
          <Beaker className="h-8 w-8 text-blue-600" />
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">LabManager</h1>
            <p className="text-sm text-gray-500">Doctor Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 space-y-1 pb-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${active 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon 
                  className={`
                    mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200
                    ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                  `} 
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>{item.name}</span>
                    {active && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Section - Fixed at Bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-medium text-sm">DR</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">Dr. John Doe</p>
            <p className="text-xs text-gray-500">Laboratory Director</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DoctorNavigation;
